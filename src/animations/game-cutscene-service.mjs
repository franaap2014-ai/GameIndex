import { db, nowIso } from "../database/connection.mjs";
import { getGameById, getGameBySlug } from "../database/repositories/game-repository.mjs";
import { getAnimationRevision, getAnimationProject } from "../database/repositories/animation-repository.mjs";
import { animationRuntimePayload } from "./animation-runtime.mjs";

function fail(code,message,status=400){const e=new Error(message);e.code=code;e.status=status;throw e;}
function game(value){return getGameById(String(value||""))||getGameBySlug(String(value||""))||null;}
function fallback(gameRow){
  return {
    mode:"FALLBACK",game:{id:gameRow.id,slug:gameRow.slug,name:gameRow.nome||gameRow.name},
    durationMs:650,
    runtime:animationRuntimePayload({
      name:`${gameRow.nome||gameRow.name} Entry`,type:"CINEMATIC",durationMs:650,background:{mode:"TRANSPARENT"},
      tracks:[
        {id:"fallback-frame",component:"FRAME",name:"GameIndex transition",color:"GAMEINDEX_BORDER",properties:{width:100,height:100,borderOpacity:.5},keyframes:[{time:0,opacity:0,scale:.98},{time:220,opacity:.8,scale:1,easing:"GI_SOFT"},{time:650,opacity:0,scale:1.02,easing:"GI_SOFT"}]},
        {id:"fallback-logo",component:"GI_G_MARK",name:"GameIndex",color:"GAMEINDEX_WHITE",keyframes:[{time:0,opacity:0,scale:.9},{time:220,opacity:.9,scale:1,easing:"GI_BOOT"},{time:650,opacity:0,scale:1.04,easing:"GI_SOFT"}]}
      ]
    })
  };
}

export function gameEntryCutscene(value){
  const g=game(value);if(!g)fail("GAME_NOT_FOUND","Jogo não encontrado.",404);
  const binding=db.prepare(`SELECT * FROM game_cutscene_bindings WHERE game_id=?`).get(g.id);
  if(!binding||binding.binding_status!=="PUBLISHED"||!binding.animation_project_id||Number(binding.active_revision)<=0)return fallback(g);
  const revision=getAnimationRevision(binding.animation_project_id,Number(binding.active_revision));
  if(!revision||revision.status!=="PUBLISHED")return fallback(g);
  const runtime=animationRuntimePayload(revision.definition);
  const max=Math.min(2500,Math.max(250,Number(binding.max_duration_ms||2000)));
  if(Number(runtime.durationMs||0)>max)return fallback(g);
  return {mode:"CUSTOM",game:{id:g.id,slug:g.slug,name:g.nome||g.name},durationMs:runtime.durationMs,projectId:binding.animation_project_id,revision:revision.revision,runtime};
}

export function listGameCutsceneBindings({limit=300}={}){
  const n=Math.max(1,Math.min(500,Number(limit)||300));
  return db.prepare(`SELECT g.id game_id,g.slug,g.name,b.animation_project_id,b.active_revision,b.binding_status,b.entry_mode,b.max_duration_ms,b.updated_at
    FROM games g LEFT JOIN game_cutscene_bindings b ON b.game_id=g.id
    WHERE g.status='PUBLISHED'
    ORDER BY lower(g.name) LIMIT ?`).all(n).map(r=>({
      gameId:r.game_id,slug:r.slug,name:r.name,projectId:r.animation_project_id||null,
      revision:Number(r.active_revision||0),status:r.binding_status||"FALLBACK",entryMode:r.entry_mode||"GAME_ENTRY",
      maxDurationMs:Number(r.max_duration_ms||2000),updatedAt:r.updated_at||""
    }));
}

export function bindGameEntryCutscene({gameId,projectId,revision,maxDurationMs=2000,actorUserId}={}){
  const g=game(gameId);if(!g)fail("GAME_NOT_FOUND","Jogo não encontrado.",404);
  const project=getAnimationProject(projectId);if(!project)fail("ANIMATION_PROJECT_NOT_FOUND","Projeto de animação não encontrado.",404);
  const rev=getAnimationRevision(project.id,Number(revision));if(!rev||rev.status!=="PUBLISHED")fail("ANIMATION_REVISION_NOT_PUBLISHED","Publique a revisão antes de vinculá-la ao jogo.",409);
  const runtime=animationRuntimePayload(rev.definition),max=Math.min(2500,Math.max(250,Number(maxDurationMs)||2000));
  if(runtime.durationMs>max)fail("GAME_CUTSCENE_TOO_LONG",`A cutscene tem ${runtime.durationMs} ms. O limite configurado é ${max} ms.`,409);
  const now=nowIso();
  db.prepare(`INSERT INTO game_cutscene_bindings(game_id,animation_project_id,active_revision,binding_status,entry_mode,max_duration_ms,updated_by,created_at,updated_at)
    VALUES(?,?,?,'PUBLISHED','GAME_ENTRY',?,?,?,?)
    ON CONFLICT(game_id) DO UPDATE SET animation_project_id=excluded.animation_project_id,active_revision=excluded.active_revision,binding_status='PUBLISHED',entry_mode='GAME_ENTRY',max_duration_ms=excluded.max_duration_ms,updated_by=excluded.updated_by,updated_at=excluded.updated_at`)
    .run(g.id,project.id,rev.revision,max,actorUserId||null,now,now);
  return listGameCutsceneBindings({limit:500}).find(x=>x.gameId===g.id);
}

export function setGameCutsceneFallback({gameId,actorUserId}={}){
  const g=game(gameId);if(!g)fail("GAME_NOT_FOUND","Jogo não encontrado.",404);const now=nowIso();
  db.prepare(`INSERT INTO game_cutscene_bindings(game_id,animation_project_id,active_revision,binding_status,entry_mode,max_duration_ms,updated_by,created_at,updated_at)
    VALUES(?,NULL,0,'FALLBACK','GAME_ENTRY',2000,?,?,?)
    ON CONFLICT(game_id) DO UPDATE SET animation_project_id=NULL,active_revision=0,binding_status='FALLBACK',updated_by=excluded.updated_by,updated_at=excluded.updated_at`)
    .run(g.id,actorUserId||null,now,now);
  return listGameCutsceneBindings({limit:500}).find(x=>x.gameId===g.id);
}
