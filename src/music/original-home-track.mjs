import {existsSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
// Only advertises a real file, explicitly enabled by the operator.
export function originalHomeTrack(){
 const path=new URL('../../public/audio/enter-the-index.mp3',import.meta.url);
 if(process.env.GAMEINDEX_ORIGINAL_HOME_MUSIC!=='1'||!existsSync(fileURLToPath(path)))return null;
 return {provider:'AUDIO',audioUrl:'/audio/enter-the-index.mp3',label:'Enter the Index · GameIndex',enabled:true,defaultVolume:30,loop:true};
}
