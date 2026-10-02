import {db,transaction,nowIso} from './connection.mjs';
import {getGameBySlug,upsertGame} from './repositories/game-repository.mjs';
import {upsertSource} from './repositories/source-repository.mjs';
import {upsertKnowledge} from './repositories/knowledge-repository.mjs';

const names={FREE:['Lua','Explorador','Raposa','Cristal','Coruja'],PRO:['Folha','Dragão','Tartaruga','Montanha','Serpente'],TESTER:['Satélite','Baleia','Orbital','Pinguim','Raia'],DEV:['Fênix','Robô','Foguete','Lobo','Vulcão'],CREATOR:['Sol','Leão','Lótus','Guardião','Ampulheta']};
export function installQualityContent(){
 if(db.prepare("SELECT value FROM meta WHERE key='content_0992_i3'").get())return;
 // Wait until a fresh database's complete base seed has finished.
 if(!db.prepare('SELECT 1 FROM games LIMIT 1').get())return;
 transaction(()=>{
  const now=nowIso();
  for(const [role,labels] of Object.entries(names))for(let i=1;i<=5;i++){
   const low=role.toLowerCase(),id=`avatar_${low}_index_${i}`,old=`/assets/profile-avatars/${low}-index-${i}.svg`,url=`/assets/profile-avatars/${low}-index-${i}-i3.svg`;
   // Preserve IDs, selections and operator-provided overrides.
   db.prepare('UPDATE user_profiles SET avatar_url=?,updated_at=? WHERE avatar_url=? AND user_id IN (SELECT user_id FROM user_profile_avatar_selections WHERE avatar_id=?)').run(url,now,old,id);
   db.prepare(`UPDATE profile_avatar_catalog SET name=?,asset_url=?,style_tags_json='["ILLUSTRATED","DISTINCT_SILHOUETTE"]',updated_at=? WHERE id=? AND asset_url=? AND built_in=1`).run(labels[i-1],url,now,id,old);
  }
  // Unlist only the requested historical entry. Never reuse its ID, claims or media.
  db.prepare("UPDATE games SET visibility='UNLISTED',updated_at=? WHERE slug='grand-theft-auto-iii' AND visibility='PUBLIC'").run(now);
  if(!getGameBySlug('red-dead-redemption-2')){
   const game=upsertGame({slug:'red-dead-redemption-2',name:'Red Dead Redemption 2',aliases:['RDR2','Red Dead 2'],description:'Em 1899, Arthur Morgan e a gangue Van der Linde fogem pelo interior dos Estados Unidos. A aventura combina exploração em mundo aberto e uma história sobre lealdade e sobrevivência.',developer:'Rockstar Games',publisher:'Rockstar Games',releaseDate:'2018-10-26',platforms:['PC','PlayStation 4','Xbox One'],genres:['Ação','Aventura','Mundo aberto'],franchise:'Red Dead',officialUrl:'https://www.rockstargames.com/reddeadredemption2/',template:'open-world',tabs:['overview','story','characters','gameplay','maps','missions','guides'],visualQuery:'Red Dead Redemption 2 Arthur Morgan official artwork'});
   const source=upsertSource({url:'https://store.rockstargames.com/game/buy-red-dead-redemption-2',title:'Rockstar Games — Red Dead Redemption 2',sourceType:'OFFICIAL',quality:.98,metadata:{verifiedOn:'2026-10-02'}});
   upsertKnowledge({gameId:game.id,title:'Red Dead Redemption 2 — mundo e protagonistas',summary:game.description,confidence:.96,status:'VALIDATED',canonStatus:'CANON',verifiedAt:'2026-10-02T00:00:00Z',tabId:'overview',sectionId:'summary',topics:['RDR2','Arthur Morgan','história','story','gangue','1899'],claims:[{text:'Red Dead Redemption 2 acompanha Arthur Morgan e a gangue Van der Linde nos Estados Unidos em 1899.',sourceIds:[source.id],confidence:.96,canonStatus:'CANON',status:'VALIDATED'}]});
  }
  db.prepare("INSERT INTO meta(key,value) VALUES('content_0992_i3','1')").run();
 });
}
