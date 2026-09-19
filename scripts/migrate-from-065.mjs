import { existsSync, mkdirSync, copyFileSync, statSync, rmSync } from "node:fs";
import path from "node:path";
import os from "node:os";
import { fileURLToPath } from "node:url";
import { DatabaseSync } from "node:sqlite";

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const args=process.argv.slice(2);
const auto=args.includes("--auto");
const explicit=args.find(x=>x!=="--auto")||process.env.GAMEVAULT_LEGACY_DB||"";
const localApp=process.env.LOCALAPPDATA||path.join(os.homedir(),".gamevault");
const persistentRoot=process.env.GAMEVAULT_DATA_DIR?path.resolve(process.env.GAMEVAULT_DATA_DIR):(process.platform==="win32"?path.join(localApp,"GameVault"):path.join(os.homedir(),".gamevault"));
const target=path.join(persistentRoot,"data","gamevault.sqlite");
const sibling=path.resolve(root,"..","GameVault-Beta-0.65-Intelligence-Content","data","gamevault-beta.sqlite");
const localLegacy=path.join(root,"data","gamevault-beta.sqlite");
function sourceFrom(input){if(!input)return null;const p=path.resolve(input);if(existsSync(p)&&statSync(p).isDirectory()){const a=path.join(p,"data","gamevault-beta.sqlite");return existsSync(a)?a:null;}return existsSync(p)?p:null;}
const source=sourceFrom(explicit)||sourceFrom(sibling)||(auto?null:sourceFrom(localLegacy));
if(!source){console.log("Nenhum banco Beta 0.65 pessoal encontrado automaticamente.");console.log("Use: node scripts/migrate-from-065.mjs \"C:\\\\caminho\\\\GameVault-Beta-0.65-Intelligence-Content\"");process.exit(auto?2:1);}
function verify(file){let db;try{db=new DatabaseSync(file,{readOnly:true});const integrity=db.prepare("PRAGMA integrity_check").get()?.integrity_check;const users=Number(db.prepare("SELECT COUNT(*) count FROM users").get()?.count||0);const games=Number(db.prepare("SELECT COUNT(*) count FROM games").get()?.count||0);db.close();return {ok:String(integrity).toLowerCase()==="ok"&&games>0,users,games,integrity};}catch(e){try{db?.close();}catch{}return {ok:false,error:e.message};}}
const before=verify(source);if(!before.ok){console.error("Banco 0.65 inválido; migração cancelada sem alterar nada.",before);process.exit(1);}
mkdirSync(path.dirname(target),{recursive:true});mkdirSync(path.join(persistentRoot,"backups"),{recursive:true});
if(existsSync(target)){
  const existing=verify(target);if(existing.ok&&existing.users>0&&!args.includes("--replace")){console.error(`Já existe um banco persistente com ${existing.users} conta(s). Nada foi sobrescrito.`);console.error("Faça backup e use migração manual consciente se quiser substituir.");process.exit(3);}
  const backup=path.join(persistentRoot,"backups",`gamevault-existing-before-import-${new Date().toISOString().replace(/[:.]/g,"-")}.sqlite`);copyFileSync(target,backup);
}
const temp=target+`.import-${process.pid}`;copyFileSync(source,temp);const copied=verify(temp);if(!copied.ok){console.error("A cópia de migração falhou na validação. O banco antigo permanece intacto.");process.exit(1);}copyFileSync(temp,target);rmSync(temp,{force:true});
console.log(`Migração segura concluída: ${copied.users} conta(s), ${copied.games} jogo(s) preservados.`);console.log(`Destino persistente: ${target}`);
