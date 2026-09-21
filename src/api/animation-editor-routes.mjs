import { currentAuth } from "../auth/auth-service.mjs";
import { requireCapability, requireSameOriginMutation } from "../access/capability-service.mjs";
import { animationRuntimePayload } from "../animations/animation-runtime.mjs";
import {
  animationEditorCatalog,animationExistingCatalog,animationProjectDetails,archiveAnimation,bindPublishedAnimation,
  createAnimationFromExisting,createAnimationFromPreset,createAnimationProject,duplicateAnimationProject,
  ensureBuiltInAnimationPresets,listAnimationEditorProjects,previewAnimationProject,publishAnimationProject,
  rollbackAnimationProject,saveAnimationProject
} from "../animations/animation-editor-service.mjs";

function actor(req){return currentAuth(req)?.user?.id||null;}
function noStore(res){res.setHeader("Cache-Control","no-store");return res;}
function fail(res,status,error){
  const code=String(error?.code||error?.message||"ANIMATION_EDITOR_ERROR").slice(0,120);
  const messages={
    ANIMATION_PROJECT_NOT_FOUND:"Projeto de animação não encontrado.",
    ANIMATION_REVISION_NOT_FOUND:"Revisão de animação não encontrada.",
    ANIMATION_PRESET_NOT_FOUND:"Preset de animação não encontrado.",
    ANIMATION_LEGACY_REFERENCE_NOT_FOUND:"Animação base não encontrada.",
    ANIMATION_SCHEMA_INVALID:"A definição da animação é inválida.",
    ANIMATION_COMPONENT_UNKNOWN:"A animação contém um componente não permitido.",
    ANIMATION_PROPERTY_NOT_ALLOWED:"A animação contém uma propriedade não permitida.",
    ANIMATION_PROJECT_ARCHIVED:"Projeto arquivado não pode ser editado.",
    ANIMATION_BINDING_CONTEXT_INVALID:"Contexto de publicação inválido."
  };
  const statusCode=code.includes("NOT_FOUND")?404:code.includes("DENIED")?403:400;
  return noStore(res).status(status||statusCode).json({ok:false,error:{code,message:messages[code]||String(error?.message||"Falha no Animation Editor.").slice(0,240)}});
}

export function registerAnimationEditorRoutes(app){
  ensureBuiltInAnimationPresets();

  app.get("/api/animation-editor/catalog",requireCapability("animation_edit"),(req,res)=>{
    try{return noStore(res).json({ok:true,...animationEditorCatalog()});}catch(error){return fail(res,400,error);}
  });
  app.get("/api/animation-editor/projects",requireCapability("animation_edit"),(req,res)=>{
    try{return noStore(res).json({ok:true,entries:listAnimationEditorProjects({limit:req.query.limit,status:req.query.status})});}catch(error){return fail(res,400,error);}
  });
  app.post("/api/animation-editor/projects",requireSameOriginMutation,requireCapability("animation_edit"),(req,res)=>{
    try{return noStore(res).status(201).json({ok:true,...createAnimationProject({name:req.body?.name,type:req.body?.type,durationMs:req.body?.durationMs,definition:req.body?.definition,actorUserId:actor(req)})});}catch(error){return fail(res,400,error);}
  });
  app.get("/api/animation-editor/projects/:id",requireCapability("animation_edit"),(req,res)=>{
    const details=animationProjectDetails(req.params.id);if(!details)return fail(res,404,Object.assign(new Error("ANIMATION_PROJECT_NOT_FOUND"),{code:"ANIMATION_PROJECT_NOT_FOUND"}));
    return noStore(res).json({ok:true,...details});
  });
  app.put("/api/animation-editor/projects/:id",requireSameOriginMutation,requireCapability("animation_edit"),(req,res)=>{
    try{return noStore(res).json({ok:true,...saveAnimationProject({projectId:req.params.id,definition:req.body?.definition,actorUserId:actor(req)})});}catch(error){return fail(res,400,error);}
  });
  app.post("/api/animation-editor/projects/:id/duplicate",requireSameOriginMutation,requireCapability("animation_edit"),(req,res)=>{
    try{return noStore(res).status(201).json({ok:true,...duplicateAnimationProject({projectId:req.params.id,actorUserId:actor(req)})});}catch(error){return fail(res,400,error);}
  });
  app.get("/api/animation-editor/projects/:id/revisions",requireCapability("animation_edit"),(req,res)=>{
    const details=animationProjectDetails(req.params.id);if(!details)return fail(res,404,Object.assign(new Error("ANIMATION_PROJECT_NOT_FOUND"),{code:"ANIMATION_PROJECT_NOT_FOUND"}));
    return noStore(res).json({ok:true,project:details.project,entries:details.revisions});
  });
  app.post("/api/animation-editor/projects/:id/preview",requireSameOriginMutation,requireCapability("animation_edit"),(req,res)=>{
    try{const preview=previewAnimationProject({projectId:req.params.id,definition:req.body?.definition||null,actorUserId:actor(req)});return noStore(res).json({ok:true,project:preview.project,runtime:animationRuntimePayload(preview.runtime),historyMutation:false});}catch(error){return fail(res,400,error);}
  });
  app.post("/api/animation-editor/projects/:id/publish",requireSameOriginMutation,requireCapability("animation_publish"),async(req,res)=>{
    try{return noStore(res).json({ok:true,...await publishAnimationProject({projectId:req.params.id,actorUserId:actor(req)})});}catch(error){return fail(res,400,error);}
  });
  app.post("/api/animation-editor/projects/:id/rollback",requireSameOriginMutation,requireCapability("animation_publish"),async(req,res)=>{
    try{return noStore(res).json({ok:true,...await rollbackAnimationProject({projectId:req.params.id,revision:req.body?.revision,actorUserId:actor(req)})});}catch(error){return fail(res,400,error);}
  });
  app.post("/api/animation-editor/projects/:id/archive",requireSameOriginMutation,requireCapability("animation_publish"),async(req,res)=>{
    try{return noStore(res).json({ok:true,project:await archiveAnimation({projectId:req.params.id,actorUserId:actor(req)})});}catch(error){return fail(res,400,error);}
  });
  app.post("/api/animation-editor/projects/:id/bind",requireSameOriginMutation,requireCapability("animation_publish"),async(req,res)=>{
    try{return noStore(res).json({ok:true,binding:await bindPublishedAnimation({projectId:req.params.id,contextType:req.body?.contextType,contextKey:req.body?.contextKey,revision:req.body?.revision,enabled:req.body?.enabled!==false,actorUserId:actor(req)})});}catch(error){return fail(res,400,error);}
  });
  app.get("/api/animation-editor/presets",requireCapability("animation_edit"),(req,res)=>{
    try{return noStore(res).json({ok:true,entries:animationEditorCatalog().presets});}catch(error){return fail(res,400,error);}
  });
  app.post("/api/animation-editor/from-preset/:preset",requireSameOriginMutation,requireCapability("animation_edit"),(req,res)=>{
    try{return noStore(res).status(201).json({ok:true,...createAnimationFromPreset({presetKey:req.params.preset,actorUserId:actor(req)})});}catch(error){return fail(res,400,error);}
  });
  app.get("/api/animation-editor/existing",requireCapability("animation_edit"),(req,res)=>{
    try{return noStore(res).json({ok:true,entries:animationExistingCatalog().map(({definition,...entry})=>entry)});}catch(error){return fail(res,400,error);}
  });
  app.post("/api/animation-editor/import/:existing",requireSameOriginMutation,requireCapability("animation_edit"),(req,res)=>{
    try{return noStore(res).status(201).json({ok:true,...createAnimationFromExisting({existingKey:req.params.existing,actorUserId:actor(req)})});}catch(error){return fail(res,400,error);}
  });
}
