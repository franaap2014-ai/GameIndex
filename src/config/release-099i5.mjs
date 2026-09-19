export const PUBLIC_VERSION="0.99";
export const PUBLIC_VERSION_LABEL=`Beta ${PUBLIC_VERSION}`;
export const INTERNAL_RELEASE="0.99-I5";
export const INTERNAL_RELEASE_LABEL="GameIndex Beta 0.99 I5";
export const INTERNAL_RELEASE_CODE="BETA_0_99_I5_PRODUCTION_CONSOLIDATION";
export const TARGET_SCHEMA=38;
export const ARCHITECTURE="LOCAL_FIRST_NO_API_KEY";

export function releaseSnapshot({technical=false}={}){
  return technical
    ? {product:"GameIndex",publicVersion:PUBLIC_VERSION,publicLabel:PUBLIC_VERSION_LABEL,internalRelease:INTERNAL_RELEASE,internalLabel:INTERNAL_RELEASE_LABEL,release:INTERNAL_RELEASE_CODE,schema:TARGET_SCHEMA,architecture:ARCHITECTURE}
    : {product:"GameIndex",version:PUBLIC_VERSION,label:PUBLIC_VERSION_LABEL};
}
