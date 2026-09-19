import { DatabaseSync } from "node:sqlite";
import { copyFileSync, readFileSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"../..");
const migrations=["004_beta_067.sql","005_beta_0675.sql","006_beta_07.sql","007_beta_0705.sql","008_beta_08.sql","009_beta_085.sql","010_beta_086.sql","011_beta_087.sql","012_beta_088.sql","013_beta_0885.sql"];
export function makeFastBeta0885Db(label="test"){
  const dbPath=path.join(os.tmpdir(),`gameindex-${label}-0885-${process.pid}-${Date.now()}-${Math.random().toString(16).slice(2)}.sqlite`);
  removeTempDb(dbPath);copyFileSync(path.join(root,"data","gamevault-beta.sqlite"),dbPath);
  const db=new DatabaseSync(dbPath);db.exec("PRAGMA foreign_keys = OFF;");
  for(const file of migrations){db.exec(readFileSync(path.join(root,"src/database/migrations",file),"utf8"));db.prepare(`INSERT INTO meta(key,value) VALUES('schema_version',?) ON CONFLICT(key) DO UPDATE SET value=excluded.value`).run(String(Number(file.slice(0,3))));}
  db.exec("PRAGMA foreign_keys = ON;");db.close();return dbPath;
}
export function removeTempDb(dbPath){for(const suffix of ["","-shm","-wal"])try{rmSync(dbPath+suffix,{force:true});}catch{}}
