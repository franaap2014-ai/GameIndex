import { randomUUID } from "node:crypto";
import { db, nowIso } from "../connection.mjs";

export function recordBrainRequest({userId=null,language="pt-BR",status="SUCCESS",durationMs=0,usedMemory=false,usedResearch=false,errorCode=""}={}){
  const id=randomUUID();
  db.prepare(`INSERT INTO brain_requests(id,user_id,language,status,duration_ms,used_memory,used_research,error_code,created_at) VALUES(?,?,?,?,?,?,?,?,?)`).run(
    id,userId,String(language||"pt-BR"),String(status||"SUCCESS"),Math.max(0,Math.round(Number(durationMs)||0)),usedMemory?1:0,usedResearch?1:0,String(errorCode||"").slice(0,80),nowIso()
  );
  return id;
}

function countWhere(where="1=1",args=[]){return Number(db.prepare(`SELECT COUNT(*) count FROM brain_requests WHERE ${where}`).get(...args).count);}
function avgWhere(where="1=1",args=[]){return Number(db.prepare(`SELECT COALESCE(AVG(duration_ms),0) value FROM brain_requests WHERE ${where}`).get(...args).value||0);}
function isoAgo(ms){return new Date(Date.now()-ms).toISOString();}

export function brainMetrics(){
  const day=isoAgo(24*60*60*1000),week=isoAgo(7*24*60*60*1000);
  const today=countWhere("created_at>=?",[day]);
  const success=countWhere("created_at>=? AND status='SUCCESS'",[day]);
  const failures=countWhere("created_at>=? AND status<>'SUCCESS'",[day]);
  const lastSuccess=db.prepare(`SELECT created_at FROM brain_requests WHERE status='SUCCESS' ORDER BY created_at DESC LIMIT 1`).get()?.created_at||"";
  const lastFailure=db.prepare(`SELECT created_at FROM brain_requests WHERE status<>'SUCCESS' ORDER BY created_at DESC LIMIT 1`).get()?.created_at||"";
  const languages={};
  for(const lang of ["pt-BR","en-US","es-ES"]){
    const total=countWhere("created_at>=? AND language=?",[day,lang]);
    const ok=countWhere("created_at>=? AND language=? AND status='SUCCESS'",[day,lang]);
    languages[lang]={total,success:ok,failures:Math.max(0,total-ok),successRate:total?Math.round(ok/total*1000)/10:100,status:total&&ok===0?"OFFLINE":(total&&ok/total<.8?"DEGRADED":"HEALTHY")};
  }
  const successRate=today?Math.round(success/today*1000)/10:100;
  const status=today===0?"NO_DATA":success===0?"OFFLINE":successRate<80?"DEGRADED":"ONLINE";
  return {
    status,
    questionsToday:today,
    questionsWeek:countWhere("created_at>=?",[week]),
    successfulToday:success,
    failedToday:failures,
    successRate,
    averageResponseMs:Math.round(avgWhere("created_at>=?",[day])),
    memoryHits:countWhere("created_at>=? AND used_memory=1",[day]),
    researchRequests:countWhere("created_at>=? AND used_research=1",[day]),
    researchFailures:countWhere("created_at>=? AND used_research=1 AND status<>'SUCCESS'",[day]),
    lastSuccess,
    lastFailure,
    languages
  };
}
