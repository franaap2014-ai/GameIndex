import { randomUUID } from "node:crypto";
import { db, nowIso, parseJson } from "../connection.mjs";
import { getBug, bugHistory } from "./bug-tracker-repository.mjs";

const SECRET_KEY=/password|senha|cookie|authorization|bearer|session|token|api[_ -]?key|setup[_ -]?code|database[_ -]?url|credential|secret/i;
const SECRET_VALUE=/(?:bearer\s+[a-z0-9._~-]+|sk-(?:proj-)?[a-z0-9_-]{8,}|password\s*[:=]|senha\s*[:=]|token\s*[:=]|cookie\s*[:=]|authorization\s*[:=])/ig;

function cleanScalar(value,max=1400){
  let text="";
  if(value===null||value===undefined)text="";
  else if(typeof value==="string")text=value;
  else if(typeof value==="number"||typeof value==="boolean")text=String(value);
  else{try{text=JSON.stringify(value);}catch{text="[unserializable]";}}
  return String(text).replace(SECRET_VALUE,"[REDACTED]").replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g," ").slice(0,max);
}

export function redactDiagnosticObject(value,depth=0){
  if(depth>5)return "[TRUNCATED]";
  if(Array.isArray(value))return value.slice(0,20).map(v=>redactDiagnosticObject(v,depth+1));
  if(value&&typeof value==="object"){
    const out={};
    for(const [key,val] of Object.entries(value).slice(0,60))out[key]=SECRET_KEY.test(key)?"[REDACTED]":redactDiagnosticObject(val,depth+1);
    return out;
  }
  return cleanScalar(value);
}

export function recordBugDiagnostics(bugId,groups={}, {source="SYSTEM"}={}){
  const bug=getBug(String(bugId));if(!bug)return [];
  const created=[];
  const insert=db.prepare("INSERT INTO bug_diagnostics(id,bug_id,category,diagnostic_key,diagnostic_value,source,created_at) VALUES(?,?,?,?,?,?,?)");
  for(const [categoryRaw,groupRaw] of Object.entries(groups||{}).slice(0,16)){
    const category=String(categoryRaw||"GENERAL").toUpperCase().replace(/[^A-Z0-9_-]/g,"_").slice(0,48)||"GENERAL";
    const group=redactDiagnosticObject(groupRaw);
    if(group&&typeof group==="object"&&!Array.isArray(group)){
      for(const [keyRaw,value] of Object.entries(group).slice(0,60)){
        const key=String(keyRaw||"value").replace(/[^a-zA-Z0-9_.:-]/g,"_").slice(0,90);
        const id="bugdiag-"+randomUUID(),now=nowIso();
        insert.run(id,bug.id,category,key,cleanScalar(value),String(source||"SYSTEM").slice(0,32),now);
        created.push({id,category,key,source,createdAt:now});
      }
    }else{
      const id="bugdiag-"+randomUUID(),now=nowIso();
      insert.run(id,bug.id,category,"value",cleanScalar(group),String(source||"SYSTEM").slice(0,32),now);
      created.push({id,category,key:"value",source,createdAt:now});
    }
  }
  return created;
}

export function listBugDiagnostics(bugId,{limit=240}={}){
  const bug=getBug(String(bugId));if(!bug)return [];
  return db.prepare("SELECT id,category,diagnostic_key,diagnostic_value,source,created_at FROM bug_diagnostics WHERE bug_id=? ORDER BY created_at,category,diagnostic_key LIMIT ?").all(bug.id,Math.min(500,Math.max(1,Number(limit)||240))).map(r=>({
    id:r.id,category:r.category,key:r.diagnostic_key,value:r.diagnostic_value,source:r.source,createdAt:r.created_at
  }));
}

function md(value=""){return String(value??"").replaceAll("```","\`\`\`").trim();}

export function developerReportForBug(idOrCode){
  const bug=getBug(String(idOrCode));if(!bug)return null;
  const history=bugHistory(bug.id)?.events||[];
  const diagnostics=listBugDiagnostics(bug.id);
  const publicReport=db.prepare("SELECT public_code,reporter_user_id,category,title,description,steps,expected_result,actual_result,page_url,client_metadata_json,created_at FROM public_bug_reports WHERE bug_id=? ORDER BY created_at DESC LIMIT 1").get(bug.id);
  const groups=new Map();
  for(const row of diagnostics){if(!groups.has(row.category))groups.set(row.category,[]);groups.get(row.category).push(row);}
  const lines=[
    "# GAME INDEX BUG REPORT",
    "## "+bug.bugCode+" — "+md(bug.title),
    "",
    "### SUMMARY",
    md(bug.description)||"No description recorded.",
    "",
    "### WORKFLOW",
    "- Status: "+bug.status,
    "- Severity: "+bug.severity,
    "- Category: "+bug.category,
    "- Component: "+(bug.component||"—"),
    "- Version found: "+(bug.versionFound||"—"),
    "- Target version: "+(bug.targetVersion||"—"),
    ""
  ];
  if(publicReport){
    lines.push("### USER REPORT",
      "- Public reference: "+publicReport.public_code,
      "- Reporter: "+(publicReport.reporter_user_id?"authenticated account":"anonymous/unknown"),
      "- Page: "+(md(publicReport.page_url)||"—"),
      "",
      "**Description:** "+(md(publicReport.description)||"—"),
      "",
      "**Expected:** "+(md(publicReport.expected_result)||"—"),
      "",
      "**Observed:** "+(md(publicReport.actual_result)||"—"),
      "",
      "**Reproduction:** "+(md(publicReport.steps)||"—"),
      "");
  }
  lines.push("### TECHNICAL EVIDENCE");
  if(!diagnostics.length)lines.push("- No structured diagnostics were captured for this legacy report.");
  for(const [category,rows] of groups){
    lines.push("","#### "+category);
    for(const row of rows)lines.push("- "+row.key+": "+(md(row.value)||"—"));
  }
  lines.push("","### POSSIBLE AFFECTED AREA",bug.component?md(bug.component):"Not enough evidence to identify a subsystem.","","> This section is a routing hint, not a confirmed root cause.");
  if(bug.rootCause)lines.push("","### RECORDED ROOT CAUSE",md(bug.rootCause),"> This value was explicitly recorded in the bug workflow; it was not inferred by this report generator.");
  lines.push("","### HISTORY");
  if(!history.length)lines.push("- No history entries.");
  for(const e of [...history].reverse().slice(-80))lines.push("- "+e.createdAt+" — "+e.eventType+(e.note?": "+md(e.note):""));
  lines.push("","### PRIVACY","Diagnostics are bounded and sanitized. Passwords, authorization tokens, cookies, setup codes and credentials are not intentionally included.");
  return {bug,publicReport:publicReport?{...publicReport,clientMetadata:parseJson(publicReport.client_metadata_json,{})}:null,diagnostics,history,markdown:lines.join("\n")};
}
