import { existsSync, mkdirSync, readdirSync, renameSync, rmSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const keepDocs=new Set(['README.md','BETA_0.985_ARCHITECTURE.md','MIGRATION_REPORT_0.985.md','RELEASE_NOTES_BETA_0.985_HF1.md','TEST_REPORT_0.985_HF1.md','UPDATE_MANIFEST_0.985_HF1.md']);
const obsolete=path.join(root,'GameIndex_Beta_0.975_BF_PRE_PUBLIC_FULL');
if(existsSync(obsolete))rmSync(obsolete,{recursive:true,force:true});
const history=path.join(root,'docs','history');mkdirSync(history,{recursive:true});
const legacy=path.join(root,'tools','legacy');mkdirSync(legacy,{recursive:true});
for(const name of readdirSync(root)){
  const full=path.join(root,name);if(!statSync(full).isFile())continue;
  if(/\.(md|txt)$/i.test(name)&&!keepDocs.has(name)){const target=path.join(history,name);if(existsSync(target))rmSync(target,{force:true});renameSync(full,target);}
  if(/\.cmd$/i.test(name)&&name!=='INICIAR_BETA_LOCAL.cmd'){const target=path.join(legacy,name);if(existsSync(target))rmSync(target,{force:true});renameSync(full,target);}
}
console.log('GameIndex 0.985 HF1 cleanup complete. Historical docs and legacy launchers organized.');
