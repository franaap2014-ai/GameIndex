import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const input=process.argv.slice(2).join(" ").replace(/^"|"$/g,"");
if(!input){console.error("Uso: node scripts/migrate-from-055.mjs <caminho-do-gamevault-beta.sqlite-antigo>");process.exit(1);}
const source=path.resolve(input);
if(!existsSync(source)){console.error(`Banco antigo não encontrado: ${source}`);process.exit(1);}
const target=path.join(root,"data","gamevault-beta.sqlite");
mkdirSync(path.dirname(target),{recursive:true});
if(existsSync(target)){
  const stamp=new Date().toISOString().replace(/[:.]/g,"-");
  const backup=path.join(root,"data","backups",`beta06-before-import-${stamp}.sqlite`);
  mkdirSync(path.dirname(backup),{recursive:true});
  copyFileSync(target,backup);
  console.log(`Backup do banco atual: ${backup}`);
}
copyFileSync(source,target);
console.log("Banco da Beta 0.55 copiado. Agora execute node server.mjs; a Beta 0.6 fará a migração preservando os dados.");
