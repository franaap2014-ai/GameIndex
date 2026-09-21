import { accessSnapshotForUser } from "../access/capability-service.mjs";
import { getProfileByUserId } from "../database/repositories/profile-repository.mjs";
import { getProfileAvatar, listProfileAvatars, profileAvatarCatalogAudit, selectProfileAvatar, selectedProfileAvatar, updateProfileAvatarCatalog } from "../database/repositories/profile-avatar-repository.mjs";

const ELIGIBILITY=Object.freeze({
  FREE:["FREE"],
  PRO:["FREE","PRO"],
  TESTER:["FREE","TESTER"],
  DEV:["FREE","DEV"],
  CREATOR:["FREE","PRO","TESTER","DEV","CREATOR"]
});

function identityFor(userId){
  const access=accessSnapshotForUser(userId);
  if(access.staffRole&&access.staffRole!=="NONE")return access.staffRole;
  return access.plan||"FREE";
}
export function profileAvatarLibraryForUser(userId){
  const identity=identityFor(userId),classes=ELIGIBILITY[identity]||ELIGIBILITY.FREE;
  return {identity,eligibleClasses:classes,selected:selectedProfileAvatar(userId),entries:listProfileAvatars({classes})};
}
export function chooseProfileAvatar(userId,avatarKey){
  const identity=identityFor(userId),classes=ELIGIBILITY[identity]||ELIGIBILITY.FREE,avatar=getProfileAvatar(avatarKey);
  if(!avatar||!avatar.enabled)throw Object.assign(new Error("Avatar indisponível."),{code:"PROFILE_AVATAR_NOT_FOUND"});
  if(!classes.includes(avatar.class))throw Object.assign(new Error("Este avatar não está disponível para sua identidade."),{code:"PROFILE_AVATAR_NOT_ELIGIBLE"});
  const selected=selectProfileAvatar(userId,avatar.id),profile=getProfileByUserId(userId);
  return {identity,selected,profile};
}
export function avatarCatalogForCreator(){
  return {audit:profileAvatarCatalogAudit(),entries:listProfileAvatars({includeDisabled:true})};
}
export function editAvatarCatalog(avatarId,payload={}){
  return updateProfileAvatarCatalog(avatarId,payload);
}
