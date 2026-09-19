import { execFileSync } from "node:child_process";
import { readdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const ignored=new Set(["node_modules","data"]);
const files=[];
function walk(dir){for(const name of readdirSync(dir)){if(ignored.has(name))continue;const full=path.join(dir,name);const s=statSync(full);if(s.isDirectory())walk(full);else if(/\.(mjs|js)$/.test(name))files.push(full);}}
walk(root);
let checked=0;
for(const file of files){execFileSync(process.execPath,["--check",file],{stdio:"pipe"});checked++;}
console.log(`Syntax OK: ${checked} JavaScript/MJS files.`);
