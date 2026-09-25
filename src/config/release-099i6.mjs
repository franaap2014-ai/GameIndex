export const PUBLIC_VERSION="0.992";
export const PUBLIC_VERSION_LABEL=`Beta ${PUBLIC_VERSION}`;
export const INTERNAL_RELEASE="0.992 I1";
export const INTERNAL_RELEASE_LABEL="GameIndex Beta 0.992 I1 Stability, UX & Dexter";
export const INTERNAL_RELEASE_CODE="BETA_0_992_I1_STABILITY_UX_DEXTER_INTELLIGENCE";
export const TARGET_SCHEMA=47;
export const ARCHITECTURE="LOCAL_FIRST_NO_API_KEY";

export function releaseSnapshotI6({technical=false}={}){
  return technical
    ? {product:"GameIndex",publicVersion:PUBLIC_VERSION,publicLabel:PUBLIC_VERSION_LABEL,internalRelease:INTERNAL_RELEASE,internalLabel:INTERNAL_RELEASE_LABEL,release:INTERNAL_RELEASE_CODE,schema:TARGET_SCHEMA,architecture:ARCHITECTURE}
    : {product:"GameIndex",version:PUBLIC_VERSION,label:PUBLIC_VERSION_LABEL};
}


export function publicReleaseSnapshot(){return releaseSnapshotI6();}
export function internalReleaseSnapshot(){return releaseSnapshotI6({technical:true});}
