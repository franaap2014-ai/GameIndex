import { seedDatabase } from "../src/database/seed.mjs";
import { db } from "../src/database/connection.mjs";
import { beta065KnowledgeReport } from "../src/database/seed-beta065.mjs";

seedDatabase();
const report=beta065KnowledgeReport();
let total=0,min=Infinity,ok=true;
console.log("GAMEINDEX BETA 0.87 — KNOWLEDGE AUDIT");
console.log("===============================================================================================");
for(const row of report){
  total+=row.count;min=Math.min(min,row.count);
  const unverified=Number(db.prepare(`SELECT COUNT(*) count FROM knowledge k JOIN games g ON g.id=k.game_id WHERE g.slug=? AND k.status='UNVERIFIED'`).get(row.slug).count);
  const duplicateTitles=Number(db.prepare(`SELECT COUNT(*) count FROM (SELECT lower(title),COUNT(*) n FROM knowledge k JOIN games g ON g.id=k.game_id WHERE g.slug=? GROUP BY lower(title) HAVING n>1)`).get(row.slug).count);
  const qualityRows=Number(db.prepare(`SELECT COUNT(*) count FROM knowledge k JOIN games g ON g.id=k.game_id JOIN knowledge_quality q ON q.knowledge_id=k.id WHERE g.slug=? AND k.status IN ('CURRENT','VALIDATED') AND length(trim(k.summary))>=120 AND q.usefulness_score>=0.70 AND q.refinement_score>=0.70`).get(row.slug).count);
  const missingSummary=Number(db.prepare(`SELECT COUNT(*) count FROM knowledge k JOIN games g ON g.id=k.game_id WHERE g.slug=? AND length(trim(k.summary))<40`).get(row.slug).count);
  const pass=row.count>=100&&row.validated>=100&&qualityRows>=100&&missingSummary===0;
  ok&&=pass;
  console.log(`${pass?"PASS":"FAIL"} | ${row.name.padEnd(36)} | total ${String(row.count).padStart(4)} | current ${String(row.validated).padStart(4)} | quality>=.70 ${String(qualityRows).padStart(4)} | unverified ${String(unverified).padStart(3)} | dup titles ${String(duplicateTitles).padStart(2)}`);
}
const artificial=Number(db.prepare(`SELECT COUNT(*) count FROM knowledge WHERE title LIKE 'Onboarding research question%' OR title LIKE '%player question%'`).get().count);
const sourceTypes=db.prepare(`SELECT source_type,COUNT(*) count FROM sources GROUP BY source_type ORDER BY count DESC`).all();
console.log("-----------------------------------------------------------------------------------------------");
console.log(`Games: ${report.length}`);
console.log(`Knowledge: ${total}`);
console.log(`Minimum per game: ${min}`);
console.log(`Artificial floor filler: ${artificial}`);
console.log(`Source classes: ${sourceTypes.map(x=>`${x.source_type}=${x.count}`).join(", ")}`);
console.log("Publication note: curated seed sources are useful persistent memory, but Triple Safety does NOT treat them as independent external evidence.");
const passed=ok&&report.length===17&&total>=1700&&artificial===0;
console.log(`Audit result: ${passed?"PASS":"FAIL"}`);
if(!passed)process.exitCode=1;
