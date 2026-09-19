import { randomUUID, createHash } from "node:crypto";
import { db, json, nowIso, parseJson, transaction } from "../database/connection.mjs";
import { slugify } from "../knowledge/normalize.mjs";
import { getGameById, parentGameFor } from "../database/repositories/game-repository.mjs";
import { resolveIdentityProfile } from "../identity/experience-identity-service.mjs";
import { resolveTechnicalProfile } from "../content/technical-profile-service.mjs";
import { listInteractiveComponents } from "../interactions/interactive-component-service.mjs";
import { listUniverseInteractions } from "../interactions/universe-interaction-service.mjs";
import { listContentMedia } from "../content/content-media-service.mjs";
import { listVisualAssets } from "../images/visual-asset-registry.mjs";

const PAGE_STATUS = new Set(["DRAFT", "PUBLISHED", "ARCHIVED"]);
const OWNERSHIP = new Set(["SYSTEM", "MANUAL", "UNIVERSE_BUILDER", "MIGRATED"]);
const SECTION_TYPES = new Set([
  "TEXT", "TECHNICAL_DATA", "CARDS", "TABLE", "TIMELINE", "MEDIA", "GALLERY",
  "INTERACTIVE", "RELATIONSHIPS", "LIST", "COMPARISON", "STATS",
]);
const LOCALES = ["pt-BR", "en-US", "es-ES"];

function hasTable(name) {
  try { return Boolean(db.prepare(`SELECT 1 FROM sqlite_master WHERE type='table' AND name=?`).get(name)); }
  catch { return false; }
}
function clean(value, max = 120) { return String(value ?? "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().slice(0, max); }
export function canonicalKey(value, fallback = "overview") {
  const base = clean(value || fallback, 100).normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toUpperCase().replace(/[^A-Z0-9]+/g, "_").replace(/^_|_$/g, "");
  return base || String(fallback).toUpperCase();
}
function localizedMap(value, fallback = "") {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    const out = {};
    for (const locale of LOCALES) {
      const v = clean(value[locale] || value["pt-BR"] || value["en-US"] || fallback, 500);
      if (v) out[locale] = v;
    }
    return out;
  }
  const v = clean(value || fallback, 500);
  return v ? Object.fromEntries(LOCALES.map((locale) => [locale, v])) : {};
}
function safeStatus(value) { const v = String(value || "DRAFT").toUpperCase(); return PAGE_STATUS.has(v) ? v : "DRAFT"; }
function safeOwnership(value) { const v = String(value || "UNIVERSE_BUILDER").toUpperCase(); return OWNERSHIP.has(v) ? v : "UNIVERSE_BUILDER"; }
function titleFor(map, language, fallback) { return map?.[language] || map?.["pt-BR"] || map?.["en-US"] || fallback || ""; }

function mapPage(r) { return r ? { id:r.id,entityGameId:r.entity_game_id,canonicalKey:r.canonical_key,slug:r.slug,title:parseJson(r.title_json,{}),summary:parseJson(r.summary_json,{}),layoutVariant:r.layout_variant,identityVariant:r.identity_variant,ownership:r.ownership,status:r.status,displayOrder:Number(r.display_order||0),revisionId:r.revision_id||null,createdAt:r.created_at,updatedAt:r.updated_at } : null; }
function mapTab(r) { return r ? { id:r.id,entityGameId:r.entity_game_id,pageId:r.page_id,canonicalKey:r.canonical_key,slug:r.slug,title:parseJson(r.title_json,{}),layoutVariant:r.layout_variant,identityVariant:r.identity_variant,ownership:r.ownership,status:r.status,displayOrder:Number(r.display_order||0),revisionId:r.revision_id||null,createdAt:r.created_at,updatedAt:r.updated_at } : null; }
function mapSection(r) { return r ? { id:r.id,entityGameId:r.entity_game_id,pageId:r.page_id,tabId:r.tab_id||null,parentSectionId:r.parent_section_id||null,canonicalKey:r.canonical_key,title:parseJson(r.title_json,{}),sectionType:r.section_type,content:parseJson(r.content_json,{}),layoutVariant:r.layout_variant,identityVariant:r.identity_variant,ownership:r.ownership,status:r.status,displayOrder:Number(r.display_order||0),revisionId:r.revision_id||null,createdAt:r.created_at,updatedAt:r.updated_at } : null; }
function mapRevision(r) { return r ? { id:r.id,entityGameId:r.entity_game_id,buildId:r.build_id||null,revisionNumber:Number(r.revision_number),status:r.status,canonicalLocale:r.canonical_locale,canonicalContent:parseJson(r.canonical_content_json,{}),translations:parseJson(r.translations_json,{}),structureSnapshot:parseJson(r.structure_snapshot_json,{}),sourceIds:parseJson(r.source_ids_json,[]),createdBy:r.created_by||null,generatedBy:r.generated_by,moderationStatus:r.moderation_status,supersedesRevisionId:r.supersedes_revision_id||null,createdAt:r.created_at,updatedAt:r.updated_at,publishedAt:r.published_at||"" } : null; }

export function nextUniverseRevisionNumber(entityGameId) {
  if (!hasTable("universe_revisions")) return 1;
  return Number(db.prepare(`SELECT COALESCE(MAX(revision_number),0)+1 value FROM universe_revisions WHERE entity_game_id=?`).get(String(entityGameId || ""))?.value || 1);
}
export function createUniverseRevision(entityGameId,{buildId=null,status="DRAFT",canonicalLocale="pt-BR",canonicalContent={},translations={},structureSnapshot={},sourceIds=[],createdBy=null,generatedBy="UNIVERSE_BUILDER",moderationStatus="DRAFT",supersedesRevisionId=null}={}) {
  if (!hasTable("universe_revisions")) throw new Error("UNIVERSE_REVISION_SCHEMA_REQUIRED");
  const id=`revision-${randomUUID()}`, number=nextUniverseRevisionNumber(entityGameId), now=nowIso(), state=String(status).toUpperCase();
  db.prepare(`INSERT INTO universe_revisions(id,entity_game_id,build_id,revision_number,status,canonical_locale,canonical_content_json,translations_json,structure_snapshot_json,source_ids_json,created_by,generated_by,moderation_status,supersedes_revision_id,created_at,updated_at,published_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`)
    .run(id,String(entityGameId),buildId||null,number,state,canonicalLocale,json(canonicalContent),json(translations),json(structureSnapshot),json([...new Set(sourceIds.filter(Boolean))]),createdBy||null,clean(generatedBy,80)||"UNIVERSE_BUILDER",clean(moderationStatus,40)||"DRAFT",supersedesRevisionId||null,now,now,state==="PUBLISHED"?now:"");
  return getUniverseRevision(id);
}
export function getUniverseRevision(id) { if(!hasTable("universe_revisions")) return null; return mapRevision(db.prepare(`SELECT * FROM universe_revisions WHERE id=?`).get(String(id||""))); }
export function latestUniverseRevision(entityGameId,{status=null}={}) {
  if(!hasTable("universe_revisions")) return null;
  const row=status
    ? db.prepare(`SELECT * FROM universe_revisions WHERE entity_game_id=? AND status=? ORDER BY revision_number DESC LIMIT 1`).get(String(entityGameId),String(status).toUpperCase())
    : db.prepare(`SELECT * FROM universe_revisions WHERE entity_game_id=? ORDER BY revision_number DESC LIMIT 1`).get(String(entityGameId));
  return mapRevision(row);
}

function manualPublishedPage(entityGameId, ck) { return db.prepare(`SELECT * FROM universe_pages WHERE entity_game_id=? AND canonical_key=? AND ownership='MANUAL' AND status='PUBLISHED' ORDER BY updated_at DESC LIMIT 1`).get(String(entityGameId), ck); }
function pageForRevision(entityGameId, ck, revisionId) {
  if (revisionId) return db.prepare(`SELECT * FROM universe_pages WHERE entity_game_id=? AND canonical_key=? AND revision_id=? LIMIT 1`).get(String(entityGameId), ck, String(revisionId));
  return db.prepare(`SELECT * FROM universe_pages WHERE entity_game_id=? AND canonical_key=? AND revision_id IS NULL ORDER BY updated_at DESC LIMIT 1`).get(String(entityGameId), ck);
}
export function upsertUniversePage({entityGameId,canonicalKey:key,title,summary="",slug="",layoutVariant="STANDARD",identityVariant="",ownership="UNIVERSE_BUILDER",status="DRAFT",displayOrder=0,revisionId=null,userId=null}={}) {
  if(!hasTable("universe_pages")) throw new Error("UNIVERSE_STRUCTURE_SCHEMA_REQUIRED");
  const ck=canonicalKey(key||title);
  const manual = revisionId ? manualPublishedPage(entityGameId, ck) : null;
  if (manual) return mapPage(manual);
  const now=nowIso(), existing=pageForRevision(entityGameId,ck,revisionId), id=existing?.id||`universe-page-${randomUUID()}`, safeSlug=slugify(slug||Object.values(localizedMap(title,ck))[0]||ck)||ck.toLowerCase();
  db.prepare(`INSERT INTO universe_pages(id,entity_game_id,canonical_key,slug,title_json,summary_json,layout_variant,identity_variant,ownership,status,display_order,revision_id,created_by,updated_by,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET slug=excluded.slug,title_json=excluded.title_json,summary_json=excluded.summary_json,layout_variant=excluded.layout_variant,identity_variant=excluded.identity_variant,ownership=CASE WHEN universe_pages.ownership='MANUAL' THEN universe_pages.ownership ELSE excluded.ownership END,status=CASE WHEN universe_pages.ownership='MANUAL' THEN universe_pages.status ELSE excluded.status END,display_order=excluded.display_order,updated_by=excluded.updated_by,updated_at=excluded.updated_at`)
    .run(id,String(entityGameId),ck,safeSlug,json(localizedMap(title,ck)),json(localizedMap(summary,"")),clean(layoutVariant,60)||"STANDARD",clean(identityVariant,80),safeOwnership(ownership),safeStatus(status),Number(displayOrder)||0,revisionId||null,userId||existing?.created_by||null,userId||null,existing?.created_at||now,now);
  return mapPage(db.prepare(`SELECT * FROM universe_pages WHERE id=?`).get(id));
}

function manualPublishedTab(pageId, ck) { return db.prepare(`SELECT * FROM universe_tabs WHERE page_id=? AND canonical_key=? AND ownership='MANUAL' AND status='PUBLISHED' ORDER BY updated_at DESC LIMIT 1`).get(String(pageId), ck); }
export function upsertUniverseTab({entityGameId,pageId,canonicalKey:key,title,slug="",layoutVariant="STANDARD",identityVariant="",ownership="UNIVERSE_BUILDER",status="DRAFT",displayOrder=0,revisionId=null}={}) {
  if(!pageId) throw new Error("PAGE_REQUIRED");
  const ck=canonicalKey(key||title), manual=revisionId?manualPublishedTab(pageId,ck):null;
  if(manual) return mapTab(manual);
  const now=nowIso(), existing=revisionId
    ? db.prepare(`SELECT * FROM universe_tabs WHERE page_id=? AND canonical_key=? AND revision_id=? LIMIT 1`).get(String(pageId),ck,String(revisionId))
    : db.prepare(`SELECT * FROM universe_tabs WHERE page_id=? AND canonical_key=? AND revision_id IS NULL ORDER BY updated_at DESC LIMIT 1`).get(String(pageId),ck);
  const id=existing?.id||`universe-tab-${randomUUID()}`, safeSlug=slugify(slug||Object.values(localizedMap(title,ck))[0]||ck)||ck.toLowerCase();
  db.prepare(`INSERT INTO universe_tabs(id,entity_game_id,page_id,canonical_key,slug,title_json,layout_variant,identity_variant,ownership,status,display_order,revision_id,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET slug=excluded.slug,title_json=excluded.title_json,layout_variant=excluded.layout_variant,identity_variant=excluded.identity_variant,ownership=CASE WHEN universe_tabs.ownership='MANUAL' THEN universe_tabs.ownership ELSE excluded.ownership END,status=CASE WHEN universe_tabs.ownership='MANUAL' THEN universe_tabs.status ELSE excluded.status END,display_order=excluded.display_order,updated_at=excluded.updated_at`)
    .run(id,String(entityGameId),String(pageId),ck,safeSlug,json(localizedMap(title,ck)),clean(layoutVariant,60)||"STANDARD",clean(identityVariant,80),safeOwnership(ownership),safeStatus(status),Number(displayOrder)||0,revisionId||null,existing?.created_at||now,now);
  return mapTab(db.prepare(`SELECT * FROM universe_tabs WHERE id=?`).get(id));
}

function manualPublishedSection(pageId, tabId, ck) { return db.prepare(`SELECT * FROM universe_sections WHERE page_id=? AND tab_id IS ? AND canonical_key=? AND ownership='MANUAL' AND status='PUBLISHED' ORDER BY updated_at DESC LIMIT 1`).get(String(pageId),tabId||null,ck); }
export function upsertUniverseSection({entityGameId,pageId,tabId=null,parentSectionId=null,canonicalKey:key,title,sectionType="TEXT",content={},layoutVariant="STANDARD",identityVariant="",ownership="UNIVERSE_BUILDER",status="DRAFT",displayOrder=0,revisionId=null}={}) {
  if(!pageId) throw new Error("PAGE_REQUIRED");
  const ck=canonicalKey(key||title), type=String(sectionType||"TEXT").toUpperCase();
  if(!SECTION_TYPES.has(type)) throw new Error("INVALID_SECTION_TYPE");
  const serialized=JSON.stringify(content||{});
  if(/<script|javascript:|onerror\s*=|onload\s*=/i.test(serialized)) throw new Error("UNSAFE_SECTION_CONTENT");
  const manual=revisionId?manualPublishedSection(pageId,tabId,ck):null;
  if(manual) return mapSection(manual);
  const now=nowIso(), existing=revisionId
    ? db.prepare(`SELECT * FROM universe_sections WHERE page_id=? AND tab_id IS ? AND canonical_key=? AND revision_id=? LIMIT 1`).get(String(pageId),tabId||null,ck,String(revisionId))
    : db.prepare(`SELECT * FROM universe_sections WHERE page_id=? AND tab_id IS ? AND canonical_key=? AND revision_id IS NULL ORDER BY updated_at DESC LIMIT 1`).get(String(pageId),tabId||null,ck);
  const id=existing?.id||`universe-section-${randomUUID()}`;
  db.prepare(`INSERT INTO universe_sections(id,entity_game_id,page_id,tab_id,parent_section_id,canonical_key,title_json,section_type,content_json,layout_variant,identity_variant,ownership,status,display_order,revision_id,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET parent_section_id=excluded.parent_section_id,title_json=excluded.title_json,section_type=excluded.section_type,content_json=excluded.content_json,layout_variant=excluded.layout_variant,identity_variant=excluded.identity_variant,ownership=CASE WHEN universe_sections.ownership='MANUAL' THEN universe_sections.ownership ELSE excluded.ownership END,status=CASE WHEN universe_sections.ownership='MANUAL' THEN universe_sections.status ELSE excluded.status END,display_order=excluded.display_order,updated_at=excluded.updated_at`)
    .run(id,String(entityGameId),String(pageId),tabId||null,parentSectionId||null,ck,json(localizedMap(title,ck)),type,json(content||{}),clean(layoutVariant,60)||"STANDARD",clean(identityVariant,80),safeOwnership(ownership),safeStatus(status),Number(displayOrder)||0,revisionId||null,existing?.created_at||now,now);
  return mapSection(db.prepare(`SELECT * FROM universe_sections WHERE id=?`).get(id));
}

export function upsertUniverseTopic({entityGameId,canonicalKey:key,title,topicType="GENERAL",priority=.5,factIds=[],targetPageKey="overview",targetTabKey="overview",targetSectionKey="summary",layoutHint="",mediaIds=[],interactionIds=[],revisionId=null}={}) {
  const ck=canonicalKey(key||title), suffix=revisionId||"live", id=`topic-${createHash("sha256").update(`${entityGameId}|${ck}|${suffix}`).digest("hex").slice(0,24)}`, now=nowIso();
  const existing=revisionId?db.prepare(`SELECT id,created_at FROM universe_topics WHERE entity_game_id=? AND canonical_key=? AND revision_id=?`).get(String(entityGameId),ck,String(revisionId)):db.prepare(`SELECT id,created_at FROM universe_topics WHERE entity_game_id=? AND canonical_key=? AND revision_id IS NULL`).get(String(entityGameId),ck);
  const rowId=existing?.id||id;
  db.prepare(`INSERT INTO universe_topics(id,entity_game_id,canonical_key,topic_type,title,priority,fact_ids_json,target_page_key,target_tab_key,target_section_key,layout_hint,media_ids_json,interaction_ids_json,revision_id,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET topic_type=excluded.topic_type,title=excluded.title,priority=excluded.priority,fact_ids_json=excluded.fact_ids_json,target_page_key=excluded.target_page_key,target_tab_key=excluded.target_tab_key,target_section_key=excluded.target_section_key,layout_hint=excluded.layout_hint,media_ids_json=excluded.media_ids_json,interaction_ids_json=excluded.interaction_ids_json,updated_at=excluded.updated_at`)
    .run(rowId,String(entityGameId),ck,clean(topicType,50).toUpperCase(),clean(title,160)||ck,Math.max(0,Math.min(1,Number(priority)||.5)),json([...new Set(factIds)]),canonicalKey(targetPageKey,"OVERVIEW").toLowerCase(),canonicalKey(targetTabKey,"OVERVIEW").toLowerCase(),canonicalKey(targetSectionKey,"SUMMARY").toLowerCase(),clean(layoutHint,80),json([...new Set(mediaIds)]),json([...new Set(interactionIds)]),revisionId||null,existing?.created_at||now,now);
  return db.prepare(`SELECT * FROM universe_topics WHERE id=?`).get(rowId);
}
export function upsertUniverseFact({entityGameId,topicKey="overview",factKey,value,confidence=.5,conflictStatus="NONE",evidenceIds=[],sourceLanguage="",retrievedAt=nowIso(),lastVerifiedAt=nowIso(),targetSectionKey="summary",revisionId=null}={}) {
  const tk=canonicalKey(topicKey,"OVERVIEW"), fk=canonicalKey(factKey,"FACT"), normalized=clean(typeof value==="string"?value:JSON.stringify(value),1200), suffix=revisionId||"live", id=`fact-${createHash("sha256").update(`${entityGameId}|${tk}|${fk}|${normalized}|${suffix}`).digest("hex").slice(0,28)}`;
  db.prepare(`INSERT INTO universe_facts(id,entity_game_id,topic_key,fact_key,value_json,normalized_value,confidence,conflict_status,evidence_ids_json,source_language,retrieved_at,last_verified_at,target_section_key,revision_id) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET confidence=MAX(universe_facts.confidence,excluded.confidence),conflict_status=excluded.conflict_status,evidence_ids_json=excluded.evidence_ids_json,last_verified_at=excluded.last_verified_at,target_section_key=excluded.target_section_key`)
    .run(id,String(entityGameId),tk,fk,json(value),normalized,Math.max(0,Math.min(1,Number(confidence)||.5)),clean(conflictStatus,40).toUpperCase(),json([...new Set(evidenceIds)]),clean(sourceLanguage,20),retrievedAt,lastVerifiedAt,canonicalKey(targetSectionKey,"SUMMARY"),revisionId||null);
  return id;
}

export function listUniverseStructure(entityGameId,{status="PUBLISHED",language="pt-BR",revisionId=null,includeManual=true}={}) {
  if(!hasTable("universe_pages")) return {pages:[]};
  const args=[String(entityGameId)], clauses=["entity_game_id=?"];
  if(revisionId){ clauses.push(`(revision_id=?${includeManual?" OR (ownership='MANUAL' AND status='PUBLISHED')":""})`); args.push(String(revisionId)); }
  else if(status){ clauses.push("status=?"); args.push(String(status).toUpperCase()); }
  const pages=db.prepare(`SELECT * FROM universe_pages WHERE ${clauses.join(" AND ")} ORDER BY display_order,canonical_key,updated_at DESC`).all(...args).map(mapPage);
  const seen=new Set();
  const uniquePages=pages.filter((p)=>{ const k=p.canonicalKey; if(seen.has(k)) return false; seen.add(k); return true; });
  return {pages:uniquePages.map((page)=>{
    const tabArgs=[page.id],tabClauses=["page_id=?"];
    const sectionArgs=[page.id],sectionClauses=["page_id=?"];
    if(revisionId){ tabClauses.push(`(revision_id=?${includeManual?" OR (ownership='MANUAL' AND status='PUBLISHED')":""})`);tabArgs.push(String(revisionId));sectionClauses.push(`(revision_id=?${includeManual?" OR (ownership='MANUAL' AND status='PUBLISHED')":""})`);sectionArgs.push(String(revisionId)); }
    else if(status){tabClauses.push("status=?");tabArgs.push(String(status).toUpperCase());sectionClauses.push("status=?");sectionArgs.push(String(status).toUpperCase());}
    const tabs=db.prepare(`SELECT * FROM universe_tabs WHERE ${tabClauses.join(" AND ")} ORDER BY display_order,canonical_key,updated_at DESC`).all(...tabArgs).map(mapTab);
    const sections=db.prepare(`SELECT * FROM universe_sections WHERE ${sectionClauses.join(" AND ")} ORDER BY display_order,canonical_key,updated_at DESC`).all(...sectionArgs).map(mapSection);
    return {...page,titleText:titleFor(page.title,language,page.canonicalKey),summaryText:titleFor(page.summary,language,""),tabs:tabs.map((tab)=>({...tab,titleText:titleFor(tab.title,language,tab.canonicalKey),sections:sections.filter((s)=>s.tabId===tab.id).map((sec)=>({...sec,titleText:titleFor(sec.title,language,sec.canonicalKey)}))})),sections:sections.filter((s)=>!s.tabId).map((sec)=>({...sec,titleText:titleFor(sec.title,language,sec.canonicalKey)}))};
  })};
}

export function ensureBaseEntityStructure(entityGameId,{revisionId=null,status="PUBLISHED",userId=null}={}) {
  const game=getGameById(entityGameId); if(!game) throw new Error("GAME_NOT_FOUND");
  const identity=resolveIdentityProfile(game.id);
  const overview=upsertUniversePage({entityGameId:game.id,canonicalKey:"OVERVIEW",title:{"pt-BR":"Visão geral","en-US":"Overview","es-ES":"Descripción general"},summary:game.descricao,layoutVariant:identity?.layoutVariant||"STANDARD",identityVariant:identity?.themeKey||"",status,displayOrder:10,revisionId,userId});
  const overviewTab=upsertUniverseTab({entityGameId:game.id,pageId:overview.id,canonicalKey:"OVERVIEW",title:{"pt-BR":"Visão geral","en-US":"Overview","es-ES":"Descripción general"},identityVariant:identity?.themeKey||"",status,displayOrder:10,revisionId});
  upsertUniverseSection({entityGameId:game.id,pageId:overview.id,tabId:overviewTab.id,canonicalKey:"SUMMARY",title:{"pt-BR":"Resumo","en-US":"Summary","es-ES":"Resumen"},sectionType:"TEXT",content:{canonical:game.descricao||"",translations:{"pt-BR":game.descricao||"","en-US":game.descricao||"","es-ES":game.descricao||""}},identityVariant:identity?.themeKey||"",status,displayOrder:10,revisionId});
  const tech=upsertUniversePage({entityGameId:game.id,canonicalKey:"TECHNICAL_INFORMATION",title:{"pt-BR":"Informações Técnicas","en-US":"Technical Information","es-ES":"Información Técnica"},summary:{"pt-BR":"Dados técnicos estruturados e verificáveis.","en-US":"Structured, verifiable technical data.","es-ES":"Datos técnicos estructurados y verificables."},layoutVariant:"TECHNICAL",identityVariant:identity?.themeKey||"",status,displayOrder:20,revisionId,userId});
  const techTab=upsertUniverseTab({entityGameId:game.id,pageId:tech.id,canonicalKey:"TECHNICAL_INFORMATION",title:{"pt-BR":"Informações Técnicas","en-US":"Technical Information","es-ES":"Información Técnica"},identityVariant:identity?.themeKey||"",status,displayOrder:10,revisionId});
  const profile=resolveTechnicalProfile(game.id);
  upsertUniverseSection({entityGameId:game.id,pageId:tech.id,tabId:techTab.id,canonicalKey:"TECHNICAL_PROFILE",title:{"pt-BR":"Ficha Técnica","en-US":"Technical Profile","es-ES":"Ficha Técnica"},sectionType:"TECHNICAL_DATA",content:{fields:profile?.fields||[],groups:profile?.groups||[],presentationVariant:profile?.presentationVariant||"DEFAULT"},layoutVariant:"TECHNICAL",identityVariant:identity?.themeKey||"",status,displayOrder:10,revisionId});
  return listUniverseStructure(game.id,{status,revisionId});
}

export function publishUniverseRevision(entityGameId,revisionId,{userId=null}={}) {
  const revision=getUniverseRevision(revisionId);
  if(!revision||revision.entityGameId!==String(entityGameId)) throw new Error("REVISION_NOT_FOUND");
  if(!["VALIDATED","PUBLISHED"].includes(revision.status)) throw new Error("REVISION_NOT_VALIDATED");
  if(revision.status==="PUBLISHED") return revision;
  return transaction(()=>{
    const now=nowIso();
    const previous=db.prepare(`SELECT id FROM universe_revisions WHERE entity_game_id=? AND status='PUBLISHED' AND id<>? ORDER BY revision_number DESC LIMIT 1`).get(String(entityGameId),String(revisionId));
    // Archive only generated/system structures. Manual published structures are explicitly preserved.
    db.prepare(`UPDATE universe_sections SET status='ARCHIVED',updated_at=? WHERE entity_game_id=? AND status='PUBLISHED' AND ownership<>'MANUAL'`).run(now,String(entityGameId));
    db.prepare(`UPDATE universe_tabs SET status='ARCHIVED',updated_at=? WHERE entity_game_id=? AND status='PUBLISHED' AND ownership<>'MANUAL'`).run(now,String(entityGameId));
    db.prepare(`UPDATE universe_pages SET status='ARCHIVED',updated_at=?,updated_by=COALESCE(?,updated_by) WHERE entity_game_id=? AND status='PUBLISHED' AND ownership<>'MANUAL'`).run(now,userId||null,String(entityGameId));
    db.prepare(`UPDATE interactive_components SET status='ARCHIVED',updated_at=? WHERE entity_game_id=? AND status='PUBLISHED'`).run(now,String(entityGameId));
    try{db.prepare(`UPDATE universe_interaction_bindings SET status='ARCHIVED',updated_at=? WHERE entity_game_id=? AND status='PUBLISHED' AND revision_id IS NOT NULL AND revision_id<>?`).run(now,String(entityGameId),String(revisionId));}catch{}
    // Content media generated by Universe Builder is revision-scoped. Keep manual/live media (revision_id IS NULL) intact.
    db.prepare(`UPDATE content_media SET status='ARCHIVED',updated_at=? WHERE entity_game_id=? AND status='APPROVED' AND revision_id IS NOT NULL AND revision_id<>?`).run(now,String(entityGameId),String(revisionId));
    if(previous) db.prepare(`UPDATE universe_revisions SET status='SUPERSEDED',updated_at=? WHERE id=?`).run(now,previous.id);
    db.prepare(`UPDATE universe_revisions SET status='PUBLISHED',moderation_status='APPROVED',published_at=?,updated_at=? WHERE id=? AND entity_game_id=?`).run(now,now,String(revisionId),String(entityGameId));
    db.prepare(`UPDATE universe_pages SET status='PUBLISHED',updated_at=?,updated_by=COALESCE(?,updated_by) WHERE entity_game_id=? AND revision_id=? AND ownership<>'MANUAL'`).run(now,userId||null,String(entityGameId),String(revisionId));
    db.prepare(`UPDATE universe_tabs SET status='PUBLISHED',updated_at=? WHERE entity_game_id=? AND revision_id=? AND ownership<>'MANUAL'`).run(now,String(entityGameId),String(revisionId));
    db.prepare(`UPDATE universe_sections SET status='PUBLISHED',updated_at=? WHERE entity_game_id=? AND revision_id=? AND ownership<>'MANUAL'`).run(now,String(entityGameId),String(revisionId));
    db.prepare(`UPDATE interactive_components SET status='PUBLISHED',updated_at=? WHERE entity_game_id=? AND revision_id=? AND status='DRAFT'`).run(now,String(entityGameId),String(revisionId));
    try{db.prepare(`UPDATE universe_interaction_bindings SET status='PUBLISHED',updated_at=? WHERE entity_game_id=? AND revision_id=? AND status='DRAFT'`).run(now,String(entityGameId),String(revisionId));}catch{}
    db.prepare(`UPDATE content_media SET status='APPROVED',updated_at=? WHERE entity_game_id=? AND revision_id=? AND status='CANDIDATE'`).run(now,String(entityGameId),String(revisionId));
    return getUniverseRevision(revisionId);
  });
}

export function publicEntityUniverse(entityGameId,{language="pt-BR"}={}) {
  const game=getGameById(entityGameId); if(!game) return null;
  const parent=parentGameFor(game), structure=listUniverseStructure(game.id,{status:"PUBLISHED",language}), identity=resolveIdentityProfile(game.id), technical=resolveTechnicalProfile(game.id), interactions=listInteractiveComponents(game.id,{status:"PUBLISHED"}), interactionBindings=listUniverseInteractions(game.id,{status:"PUBLISHED"}), media=listContentMedia(game.id,{status:"APPROVED"}), visualAssets=listVisualAssets(game.id,{approvalStatus:"APPROVED",limit:120}), revision=latestUniverseRevision(game.id,{status:"PUBLISHED"});
  let visualValidation=null;try{const row=db.prepare(`SELECT * FROM visual_grounding_validation WHERE entity_game_id=?`).get(game.id);if(row)visualValidation={requestedDensity:row.requested_density,coverageScore:Number(row.coverage_score||0),coverageClass:row.coverage_class,status:row.status,metrics:parseJson(row.metrics_json,{}),blockers:parseJson(row.blockers_json,[]),warnings:parseJson(row.warnings_json,[]),updatedAt:row.updated_at};}catch{}
  return {entity:{id:game.id,slug:game.slug,name:game.nome,entityType:game.entityType||"GAME",parent:parent?{id:parent.id,slug:parent.slug,name:parent.nome}:null,rootGameId:game.rootGameId||game.id,relationshipType:game.relationshipType||""},identity,technical,structure,interactions,interactionBindings,media,visualAssets,visualValidation,revision:revision?{id:revision.id,revisionNumber:revision.revisionNumber,publishedAt:revision.publishedAt}:null};
}
