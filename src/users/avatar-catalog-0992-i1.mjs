import {db,transaction,nowIso} from '../database/connection.mjs';
export function installIdentityCatalog(){
 if(db.prepare("SELECT value FROM meta WHERE key='avatar_catalog_0992_i1'").get())return;
 if(!db.prepare("SELECT 1 FROM sqlite_master WHERE name='profile_avatar_catalog'").get())return;
 const themes={FREE:['Lunar','#eef3ff'],PRO:['Órbita','#78f0ba'],TESTER:['Horizonte','#80ccff'],DEV:['Aurora','#ff9986'],CREATOR:['Soberano','#ffe39c']},names=['Índice','Portal','Nexo','Arquivo','Sinal'],now=nowIso();
 transaction(()=>{for(const [role,[theme,color]] of Object.entries(themes)){const low=role.toLowerCase();for(let i=1;i<=5;i++){const id=`avatar_${low}_index_${i}`,url=`/assets/profile-avatars/${low}-index-${i}.svg`;db.prepare(`INSERT OR IGNORE INTO profile_avatar_catalog(id,avatar_key,name,class,asset_url,accent_color,style_tags_json,dominant_class_color,enabled,built_in,placeholder,sort_order,created_at,updated_at) VALUES(?,?,?,?,?,?,'["INDEX_EMBLEM"]',1,1,1,0,?,?,?)`).run(id,`${low}_index_${i}`,`${theme} · ${names[i-1]}`,role,url,color,i,now,now);}
 const old=db.prepare("SELECT id,asset_url,sort_order FROM profile_avatar_catalog WHERE class=? AND built_in=1 AND placeholder=1").all(role);
 for(const row of old){const i=(Math.max(1,Number(row.sort_order)||1)-1)%5+1,url=`/assets/profile-avatars/${low}-index-${i}.svg`,id=`avatar_${low}_index_${i}`;db.prepare('UPDATE user_profiles SET avatar_url=?,updated_at=? WHERE user_id IN (SELECT user_id FROM user_profile_avatar_selections WHERE avatar_id=?) AND avatar_url=?').run(url,now,row.id,row.asset_url);db.prepare('UPDATE user_profile_avatar_selections SET avatar_id=? WHERE avatar_id=?').run(id,row.id);db.prepare('UPDATE profile_avatar_catalog SET enabled=0 WHERE id=?').run(row.id);}
 }db.prepare("INSERT INTO meta(key,value) VALUES('avatar_catalog_0992_i1','1')").run();});
}
