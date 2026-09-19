import { db } from "../src/database/connection.mjs";
import { seedDatabase } from "../src/database/seed.mjs";
seedDatabase();
const email=String(process.argv[2]||"").trim().toLowerCase();
if(!email){console.error("Uso: node scripts/set-admin.mjs seu-email@exemplo.com");process.exit(1);}
const user=db.prepare(`SELECT id,email,display_name FROM users WHERE lower(email)=?`).get(email);
if(!user){console.error("Conta não encontrada. Crie/login na conta primeiro e rode novamente.");process.exit(2);}
db.exec('BEGIN IMMEDIATE');
try{
  db.prepare(`UPDATE users SET role='USER' WHERE role='ADMIN' AND id<>?`).run(user.id);
  db.prepare(`UPDATE users SET role='ADMIN',updated_at=datetime('now') WHERE id=?`).run(user.id);
  db.exec('COMMIT');
}catch(error){try{db.exec('ROLLBACK');}catch{}throw error;}
console.log(`ADMIN exclusivo configurado: ${user.display_name||user.email} <${user.email}>`);
