const DEFAULT_URL="http://127.0.0.1:11434";
const DEFAULT_MODEL="gemma3:4b";

function cleanBase(value){return String(value||DEFAULT_URL).replace(/\/+$/,"");}
function timeoutFor(kind="STANDARD"){
  const defaults={FAST:12000,STANDARD:45000,DEEP:120000,VISION:60000};
  const key=String(kind||"STANDARD").toUpperCase();
  const configured=Number(process.env[`DEXTER_TIMEOUT_${key}_MS`]||0);
  return Math.max(3000,Math.min(180000,configured||defaults[key]||defaults.STANDARD));
}
function parseModelJson(text=""){
  const raw=String(text||"").trim();
  if(!raw)return null;
  try{return JSON.parse(raw);}catch{}
  const fenced=raw.match(/```(?:json)?\s*([\s\S]*?)```/i)?.[1];
  if(fenced){try{return JSON.parse(fenced);}catch{}}
  const first=raw.indexOf("{"),last=raw.lastIndexOf("}");
  if(first>=0&&last>first){try{return JSON.parse(raw.slice(first,last+1));}catch{}}
  return null;
}

export function ollamaConfig(){
  return {
    provider:"ollama",
    url:cleanBase(process.env.DEXTER_OLLAMA_URL||DEFAULT_URL),
    model:String(process.env.DEXTER_MODEL||DEFAULT_MODEL),
    apiKeyRequired:false,
    temperature:Number(process.env.DEXTER_TEMPERATURE||0.25),
    topP:Number(process.env.DEXTER_TOP_P||0.9),
    topK:Number(process.env.DEXTER_TOP_K||48)
  };
}

async function jsonFetch(url,{method="GET",body=null,timeoutMs=10000,signal=null}={}){
  const controller=new AbortController();
  const onAbort=()=>controller.abort(signal?.reason);
  signal?.addEventListener?.("abort",onAbort,{once:true});
  const timer=setTimeout(()=>controller.abort(new Error("OLLAMA_TIMEOUT")),timeoutMs);
  try{
    const response=await fetch(url,{method,headers:body?{"content-type":"application/json"}:undefined,body:body?JSON.stringify(body):undefined,signal:controller.signal});
    const text=await response.text();
    let data=null;try{data=text?JSON.parse(text):{};}catch{data={raw:text};}
    if(!response.ok)throw Object.assign(new Error(data?.error||`OLLAMA_HTTP_${response.status}`),{code:`OLLAMA_HTTP_${response.status}`,status:response.status});
    return data;
  }catch(error){
    if(error?.name==="AbortError")throw Object.assign(new Error("OLLAMA_TIMEOUT"),{code:"OLLAMA_TIMEOUT"});
    throw error;
  }finally{clearTimeout(timer);signal?.removeEventListener?.("abort",onAbort);}
}

export async function ollamaHealth({signal=null}={}){
  const cfg=ollamaConfig(),started=Date.now();
  try{
    const data=await jsonFetch(`${cfg.url}/api/tags`,{timeoutMs:Math.min(2500,timeoutFor("FAST")),signal});
    const models=(data?.models||[]).map(x=>String(x.name||x.model||""));
    return {reachable:true,provider:"ollama",model:cfg.model,modelInstalled:models.includes(cfg.model)||models.some(x=>x.split(":")[0]===cfg.model.split(":")[0]),models:models.slice(0,20),latencyMs:Date.now()-started,apiKeyRequired:false,urlKind:/127\.0\.0\.1|localhost/.test(cfg.url)?"LOCAL":"REMOTE_PRIVATE_OR_CONFIGURED"};
  }catch(error){return {reachable:false,provider:"ollama",model:cfg.model,modelInstalled:false,models:[],latencyMs:Date.now()-started,apiKeyRequired:false,errorCode:error?.code||"OLLAMA_UNREACHABLE",urlKind:/127\.0\.0\.1|localhost/.test(cfg.url)?"LOCAL":"REMOTE_PRIVATE_OR_CONFIGURED"};}
}

export async function ollamaStructured({system="",prompt="",images=[],schemaHint="Return one valid JSON object only.",timeoutClass="STANDARD",temperature=null,signal=null}={}){
  const cfg=ollamaConfig();
  const message={role:"user",content:String(prompt||"")};
  if(Array.isArray(images)&&images.length)message.images=images.map(x=>Buffer.isBuffer(x)?x.toString("base64"):String(x));
  const body={
    model:cfg.model,
    stream:false,
    format:"json",
    options:{temperature:temperature??cfg.temperature,top_p:cfg.topP,top_k:cfg.topK},
    messages:[...(system?[{role:"system",content:`${system}\n${schemaHint}`}]:[]),message]
  };
  const started=Date.now();
  const data=await jsonFetch(`${cfg.url}/api/chat`,{method:"POST",body,timeoutMs:timeoutFor(images.length?"VISION":timeoutClass),signal});
  const content=String(data?.message?.content||"");
  const parsed=parseModelJson(content);
  if(!parsed)throw Object.assign(new Error("DEXTER_INVALID_JSON"),{code:"DEXTER_INVALID_JSON",raw:content.slice(0,500)});
  return {data:parsed,model:data?.model||cfg.model,durationMs:Date.now()-started,evalCount:Number(data?.eval_count||0),promptEvalCount:Number(data?.prompt_eval_count||0)};
}
