/* Dexter Remaster 0.93: opt-in cloud model provider; Ollama remains default. */
import {ollamaConfig,ollamaHealth,ollamaStructured} from './ollama-provider.mjs';

const approved=new Set(['openai','openai-compatible']);
function mode(){return String(process.env.DEXTER_PROVIDER||'ollama').toLowerCase();}
function baseUrl(){return String(process.env.DEXTER_API_BASE_URL||'https://api.openai.com/v1').trim().replace(/\/+$/,'');}
function error(code,message=code){return Object.assign(new Error(message),{code});}
function cloudConfig(){
  const base=baseUrl(),apiKey=String(process.env.DEXTER_API_KEY||process.env.OPENAI_API_KEY||'').trim();
  const model=String(process.env.DEXTER_MODEL||'gpt-4.1-mini').trim();
  let valid=false;
  try{const url=new URL(base);valid=url.protocol==='https:'&&!url.username&&!url.password&&!url.search&&!url.hash;}catch{}
  return {provider:'openai-compatible',model,base,apiKey,enabled:Boolean(apiKey)&&valid,valid,apiKeyRequired:true};
}
export function dexterModelConfig(){
  if(!approved.has(mode()))return ollamaConfig();
  const {model,enabled,valid}=cloudConfig();
  return {provider:'openai-compatible',model,apiKeyRequired:true,enabled,valid,endpointKind:'HTTPS_CONFIGURED'};
}
async function query(url,{body=null,signal=null,timeoutMs=15000}={}){
  const cfg=cloudConfig();
  if(!cfg.valid)throw error('DEXTER_INVALID_PROVIDER_URL');
  if(!cfg.apiKey)throw error('DEXTER_PROVIDER_NOT_CONFIGURED');
  const own=new AbortController();
  const abort=()=>own.abort(signal?.reason);
  if(signal?.aborted)abort();
  signal?.addEventListener('abort',abort,{once:true});
  const timer=setTimeout(()=>own.abort(error('DEXTER_PROVIDER_TIMEOUT')),timeoutMs);
  try{
    const r=await fetch(url,{method:body?'POST':'GET',headers:{Authorization:`Bearer ${cfg.apiKey}`,...(body?{'Content-Type':'application/json'}:{})},body:body?JSON.stringify(body):undefined,signal:own.signal});
    const raw=await r.text();
    if(!r.ok)throw error(`DEXTER_PROVIDER_HTTP_${r.status}`);
    if(raw.length>1_000_000)throw error('DEXTER_RESPONSE_TOO_LARGE');
    try{return JSON.parse(raw);}catch{throw error('DEXTER_PROVIDER_BAD_JSON');}
  }catch(e){if(own.signal.aborted)throw error(signal?.aborted?'DEXTER_CANCELLED':'DEXTER_PROVIDER_TIMEOUT');throw e;}
  finally{clearTimeout(timer);signal?.removeEventListener('abort',abort);}
}
function extractJson(value){
  if(typeof value!=='string')return null;
  let text=value.trim();
  if(text.startsWith('```'))text=text.replace(/^```(?:json)?\s*/i,'').replace(/\s*```$/,'');
  try{return JSON.parse(text);}catch{return null;}
}
export async function dexterModelHealth({signal=null}={}){
  if(!approved.has(mode()))return ollamaHealth({signal});
  const cfg=cloudConfig();
  if(!cfg.enabled)return {reachable:false,modelInstalled:false,provider:'openai-compatible',model:cfg.model,errorCode:cfg.valid?'DEXTER_PROVIDER_NOT_CONFIGURED':'DEXTER_INVALID_PROVIDER_URL',apiKeyRequired:true};
  const started=Date.now();
  try{
    const result=await query(cfg.base+'/models',{signal,timeoutMs:3500});
    const models=(result?.data||[]).map(x=>x?.id).filter(Boolean);
    return {reachable:true,modelInstalled:models.includes(cfg.model),provider:'openai-compatible',model:cfg.model,latencyMs:Date.now()-started,apiKeyRequired:true,endpointKind:'HTTPS_CONFIGURED'};
  }catch(e){return {reachable:false,modelInstalled:false,provider:'openai-compatible',model:cfg.model,latencyMs:Date.now()-started,apiKeyRequired:true,errorCode:e.code||'DEXTER_PROVIDER_UNAVAILABLE'};}
}
export async function dexterModelStructured({system='',prompt='',images=[],timeoutClass='STANDARD',temperature=null,signal=null}={}){
  if(!approved.has(mode()))return ollamaStructured({system,prompt,images,timeoutClass,temperature,signal});
  const cfg=cloudConfig();
  if(images.length)throw error('DEXTER_CLOUD_VISION_NOT_CONFIGURED');
  if(!cfg.enabled)throw error('DEXTER_PROVIDER_NOT_CONFIGURED');
  const timeouts={FAST:12000,STANDARD:45000,DEEP:120000,VISION:60000};
  const maxMs=Math.max(3000,Math.min(180000,Number(process.env[`DEXTER_TIMEOUT_${String(timeoutClass).toUpperCase()}_MS`]||timeouts[String(timeoutClass).toUpperCase()]||45000)));
  const started=Date.now();
  const body={model:cfg.model,messages:[{role:'system',content:(system||'You are Dexter, an assistant for GameIndex.')+'\nRespond with one valid JSON object only.'},{role:'user',content:String(prompt||'')}],response_format:{type:'json_object'},temperature:temperature??0.2};
  const result=await query(cfg.base+'/chat/completions',{body,timeoutMs:maxMs,signal});
  const text=result?.choices?.[0]?.message?.content;
  const parsed=extractJson(text);
  if(!parsed||Array.isArray(parsed)||typeof parsed!=='object')throw error('DEXTER_INVALID_JSON');
  return {data:parsed,model:result?.model||cfg.model,durationMs:Date.now()-started,promptEvalCount:Number(result?.usage?.prompt_tokens||0),evalCount:Number(result?.usage?.completion_tokens||0)};
}
