import { db } from "../src/database/connection.mjs";
import { seedDatabase } from "../src/database/seed.mjs";
import { normalizeUsername } from "../src/users/username-policy.mjs";
seedDatabase();

const requested=String(process.argv[2]||"Franchesco01").trim();
const normalized=normalizeUsername(requested);
let rows=db.prepare(`SELECT u.id,u.email,u.display_name,p.username,p.normalized_username FROM users u JOIN user_profiles p ON p.user_id=u.id WHERE p.normalized_username=? OR lower(p.username)=?`).all(normalized,normalized);
if(rows.length!==1){
  console.error(rows.length===0?`Conta @${requested} não encontrada. Entre/crie a conta e configure o username antes.`:`Há mais de uma conta legada conflitante com @${requested}. Resolva o conflito antes de conceder ADMIN.`);
  process.exit(rows.length===0?2:3);
}
const user=rows[0];
const now=new Date().toISOString();
db.exec("BEGIN IMMEDIATE");
try{
  db.prepare(`UPDATE users SET role='ADMIN',updated_at=? WHERE id=?`).run(now,user.id);
  db.prepare(`INSERT INTO meta(key,value) VALUES('admin_setup_required','0') ON CONFLICT(key) DO UPDATE SET value='0'`).run();
  db.prepare(`INSERT INTO meta(key,value) VALUES('primary_admin_user_id',?) ON CONFLICT(key) DO UPDATE SET value=excluded.value`).run(user.id);
  db.exec("COMMIT");
}catch(error){try{db.exec("ROLLBACK");}catch{}throw error;}
console.log(`ADMIN configurado com segurança para @${user.username} (${user.email}).`);
