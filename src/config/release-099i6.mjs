export const PUBLIC_VERSION="0.991";
export const PUBLIC_VERSION_LABEL=`Beta ${PUBLIC_VERSION}`;
export const INTERNAL_RELEASE="0.991-HF1";
export const INTERNAL_RELEASE_LABEL="GameIndex Beta 0.991 HF1";
export const INTERNAL_RELEASE_CODE="BETA_0_991_HF1_IDENTITY_RESTORATION";
export const TARGET_SCHEMA=41;
export const ARCHITECTURE="LOCAL_FIRST_NO_API_KEY";

export function releaseSnapshotI6({technical=false}={}){
  return technical
    ? {product:"GameIndex",publicVersion:PUBLIC_VERSION,publicLabel:PUBLIC_VERSION_LABEL,internalRelease:INTERNAL_RELEASE,internalLabel:INTERNAL_RELEASE_LABEL,release:INTERNAL_RELEASE_CODE,schema:TARGET_SCHEMA,architecture:ARCHITECTURE}
    : {product:"GameIndex",version:PUBLIC_VERSION,label:PUBLIC_VERSION_LABEL};
}
