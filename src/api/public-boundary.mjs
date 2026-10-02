import {randomUUID} from 'node:crypto';
import {accessSnapshot,hasCapability} from '../access/capability-service.mjs';
import {publicReleaseSnapshot} from '../config/release-099i6.mjs';

const internalError=/SQLITE|SQLSTATE|postgres|neon|schema|migration|constraint|no such (?:table|column)|stack trace|ECONN|ENOENT|TypeError|ReferenceError|[A-Z]{3,}_[A-Z_]{3,}/i;
const secretKeys=/^(?:chainOfThought|chain_of_thought|hiddenReasoning|privateReasoning|systemPrompt|system_prompt|secretPrompt|apiKey|api_key|password|credential|connectionString|databaseUrl|stack)$/i;
export function redactTechnicalPayload(value){
 if(Array.isArray(value))return value.map(redactTechnicalPayload);
 if(!value||typeof value!=='object')return value;
 return Object.fromEntries(Object.entries(value).filter(([key])=>!secretKeys.test(key)).map(([key,v])=>[key,redactTechnicalPayload(v)]));
}
export function safePublicError(message,status=500){
 if(status>=500||!message||internalError.test(String(message)))return 'Não foi possível concluir a operação. Tente novamente em instantes.';
 return String(message).slice(0,300);
}
export function installPublicBoundary(app){
 app.use((req,res,next)=>{
  // Match only historical release summaries, not functional settings or game status.
  if(req.path==='/health'){req.url='/api/health';return next();}
  if(/^\/api\/beta\d+\/status\/?$/.test(req.path)){
   const access=accessSnapshot(req);
   if(!hasCapability(access,'ai_diagnostics'))return res.json({ok:true,...publicReleaseSnapshot()});
   res.setHeader('Cache-Control','private, no-store');
  }
  if(!req.path.startsWith('/api/'))return next();
  const json=res.json.bind(res);
  res.json=payload=>{
   if(res.statusCode>=400&&payload&&typeof payload==='object'){
    const text=payload.error?.message||payload.erro||payload.message;
    const code=String(payload.code||payload.error?.code||'');const publicCode=/^(?:AUTH_REQUIRED|FORBIDDEN|CAPABILITY_REQUIRED|CAPABILITY_DENIED|ORIGIN_DENIED|ORIGIN_INVALID|CONTENT_TYPE_REQUIRED|INVALID_CREDENTIALS|VALIDATION_ERROR|NOT_FOUND|RATE_LIMITED|TWO_FACTOR_REQUIRED)$/.test(code)?code:undefined;payload={ok:false,...(publicCode?{code:publicCode}:{}),error:{...(publicCode?{code:publicCode}:{}),message:safePublicError(text,res.statusCode)},erro:safePublicError(text,res.statusCode),...(payload.correlationId?{correlationId:payload.correlationId}:{})};
   }else if(/^\/api\/admin\/(?:flows|ai\d+\/traces)/.test(req.path))payload=redactTechnicalPayload(payload);
   return json(payload);
  };
  next();
 });
}
export function publicErrorBoundary(error,req,res,next){
 if(res.headersSent)return next(error);
 const correlationId=randomUUID();
 console.error('[GameIndex]',JSON.stringify({feature:'request',operation:req.method,status:'failed',error_code:error.code||error.name||'UNKNOWN',correlation_id:correlationId}));
 const status=Number(error.status)||500;
 res.status(status>=400&&status<=599?status:500).json({ok:false,erro:safePublicError(error.message,status),correlationId});
}
