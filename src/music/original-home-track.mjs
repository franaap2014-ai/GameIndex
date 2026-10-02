import {existsSync,statSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
// WAV/OGG are preferred for a mastered, gapless loop; MP3 remains supported.
export function originalHomeTrack(){
 if(process.env.GAMEINDEX_ORIGINAL_HOME_MUSIC!=='1')return null;
 for(const file of ['enter-the-index.ogg','enter-the-index.mp3','enter-the-index.wav']){
  const path=fileURLToPath(new URL(`../../public/audio/${file}`,import.meta.url));
  if(existsSync(path)&&statSync(path).isFile()&&statSync(path).size>1024)return {provider:'AUDIO',audioUrl:`/audio/${file}`,label:'Enter the Index · GameIndex',enabled:true,defaultVolume:30,loop:true};
 }
 return null;
}
