export const PUBLIC_VERSION="0.9915";
export const PUBLIC_VERSION_LABEL=`Beta ${PUBLIC_VERSION}`;
export const INTERNAL_RELEASE="0.9915 I1 HF2";
export const INTERNAL_RELEASE_LABEL="GameIndex Beta 0.9915 I1 HF2 Audit and Reliability Hotfix";
export const INTERNAL_RELEASE_CODE="BETA_0_9915_I1_HF2_AUDIT";
export const TARGET_SCHEMA=47;
export const ARCHITECTURE="LOCAL_FIRST_NO_API_KEY";

export function releaseSnapshotI6({technical=false}={}){
  return technical
    ? {product:"GameIndex",publicVersion:PUBLIC_VERSION,publicLabel:PUBLIC_VERSION_LABEL,internalRelease:INTERNAL_RELEASE,internalLabel:INTERNAL_RELEASE_LABEL,release:INTERNAL_RELEASE_CODE,schema:TARGET_SCHEMA,architecture:ARCHITECTURE}
    : {product:"GameIndex",version:PUBLIC_VERSION,label:PUBLIC_VERSION_LABEL};
}


export function publicReleaseSnapshot(){return releaseSnapshotI6();}
export function internalReleaseSnapshot(){return releaseSnapshotI6({technical:true});}
