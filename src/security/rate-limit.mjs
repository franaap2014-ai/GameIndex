import { createHash } from "node:crypto";

const stores=new Map();
function keyOf(req) {
  const raw=req.ip || req.socket?.remoteAddress || "local";
  return createHash("sha256").update(raw).digest("hex").slice(0,20);
}

export function rateLimit({name="default",windowMs=60_000,max=60,message="Muitas solicitações. Tente novamente em instantes."}={}) {
  if (!stores.has(name)) stores.set(name,new Map());
  const store=stores.get(name);
  return (req,res,next)=>{
    const now=Date.now(),key=keyOf(req);
    const entry=store.get(key);
    if (!entry || entry.reset<=now) store.set(key,{count:1,reset:now+windowMs});
    else {
      entry.count++;
      if (entry.count>max) {res.setHeader("Retry-After",String(Math.max(1,Math.ceil((entry.reset-now)/1000))));return res.status(429).json({erro:message,retryAfterMs:entry.reset-now});}
    }
    if (store.size>5000) for (const [k,v] of store) if (v.reset<=now) store.delete(k);
    next();
  };
}
