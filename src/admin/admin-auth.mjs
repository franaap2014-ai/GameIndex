import { currentAuth } from "../auth/auth-service.mjs";
import { getUserById } from "../database/repositories/user-repository.mjs";

export function adminSession(req){
  const session=currentAuth(req);
  if(!session)return null;
  const user=getUserById(session.user.id);
  if(!user || user.role!=="ADMIN")return null;
  return {...session,user};
}

export function requireAdmin(req,res,next){
  const session=adminSession(req);
  if(!session)return res.status(403).json({erro:"Acesso restrito ao administrador do GameIndex."});
  req.gameVaultAdmin=session;
  next();
}
