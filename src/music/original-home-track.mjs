import { existsSync } from "node:fs";

const ENTER_THE_INDEX=Object.freeze({
  key:"enter-the-index",
  label:"Enter the Index",
  kind:"LOCAL_AUDIO",
  audioUrl:"/assets/music/enter-the-index.mp3",
  defaultVolume:30,
  loop:true,
  targetDurationSeconds:[150,180],
  identity:["original","technological","cinematic","modern-electronic","instrumental"]
});

const assetUrl=new URL("../../public/assets/music/enter-the-index.mp3",import.meta.url);

export function originalHomeTrack(){
  return {...ENTER_THE_INDEX,available:existsSync(assetUrl)};
}
