import { enqueueJob } from "./job-engine.mjs";
import { recordOperation } from "./metrics.mjs";
import { publishCoreEvent } from "./message-bus.mjs";

export function routeJobCompletion(job,result={}){
  const started=Date.now(),next=[];
  for(const spec of result.nextJobs||[]){
    const queued=enqueueJob({gameId:job.gameId,entityId:job.entityId,manifestId:job.manifestId,manifestItemId:job.manifestItemId,revision:spec.revision||job.revision||1,jobType:spec.jobType,priority:spec.priority??job.priority,input:{...(job.input||{}),...(spec.input||{})},maxAttempts:spec.maxAttempts||4});
    next.push(queued);
  }
  publishCoreEvent("CORE_ROUTED",{gameId:job.gameId,entityId:job.entityId,subjectType:"JOB",subjectId:job.id,fromJobType:job.jobType,nextJobTypes:next.map(x=>x.jobType)});
  recordOperation({type:"CORE",name:"ORCHESTRATION_ROUTING",gameId:job.gameId,entityId:job.entityId,durationMs:Date.now()-started,aiAvoided:true,details:{from:job.jobType,next:next.map(x=>x.jobType)}});
  return next;
}
