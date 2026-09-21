const $=id=>document.getElementById(id),esc=v=>GV.safe(v??"");
const params=new URLSearchParams(location.search),userId=params.get("id")||"",username=params.get("u")||"";
function avatarUrl(p={},name="",classification="FREE"){return p.avatarDisplayUrl||p.avatarUrl||GV.autoAvatar({seed:p.userId||p.id||name,name,classification});}
function apiBase(){return userId?`/api/users/id/${encodeURIComponent(userId)}`:`/api/users/${encodeURIComponent(username)}`;}
function friendStrip(items=[]){return items.length?items.map(p=>{const name=p.displayName||p.username||"Jogador";return `<a class="gi9915-friend" href="/user.html?id=${encodeURIComponent(p.userId||p.id)}"><span class="gi9915-friend-avatar"><img src="${esc(avatarUrl(p,name,p.badge||p.staffRole||"FREE"))}" alt="${esc(name)}" loading="lazy"></span><strong>${esc(name)}</strong></a>`;}).join(""):'<div class="gi9915-social-empty">Nenhum amigo público para mostrar.</div>';}
function gameGrid(items=[],empty){return items.length?items.map(g=>`<a class="gi9915-game-tile" href="/game.html?slug=${encodeURIComponent(g.slug)}"><strong>${esc(g.nome||g.name)}</strong><small>${esc(g.franquia||g.desenvolvedor||g.developer||"GameIndex")}</small></a>`).join(""):`<div class="gi9915-social-empty">${esc(empty)}</div>`;}
async function load(){
  const box=$("publicProfile");if(!userId&&!username){box.innerHTML='<div class="empty-state">Perfil não informado.</div>';return;}
  try{
    const p=await GV.api(apiBase()),s=p.socialProfile||{},name=s.displayName||s.username||"Jogador",rel=p.relationship||{},targetId=s.userId||p.user?.id||userId,identity=p.user?.staffRole&&p.user.staffRole!=="NONE"?p.user.staffRole:(p.user?.badge||"FREE");
    if(rel.self){location.href="/profile.html";return;}
    box.className="gi9915-page";
    box.innerHTML=`
      <section class="gi9915-profile-hero">
        <div class="gi9915-profile-avatar"><img src="${esc(avatarUrl(s,name,identity))}" alt="${esc(name)}"></div>
        <div>
          <p class="gi9915-kicker">PERFIL</p>
          <div class="gi9915-profile-title"><h1>${esc(name)}</h1>${p.user?.badge&&p.user.badge!=="FREE"?`<span class="trace-pill ok">${esc(p.user.badge)}</span>`:""}</div>
          <p class="gi9915-profile-handle">@${esc(s.username||"")}</p>
          ${s.bio?`<p>${esc(s.bio)}</p>`:""}
          <div class="gi9915-profile-counts">
            <span><strong>${Number(p.counts?.friends||0)}</strong> Amigos</span>
            <span><strong>${Number(p.counts?.followers||0)}</strong> Seguidores</span>
            <span><strong>${Number(p.counts?.following||0)}</strong> Seguindo</span>
            <span><strong>${Number(p.counts?.followedGames||0)}</strong> Jogos seguidos</span>
          </div>
          <div class="gi9915-profile-actions"><button class="gi9915-button ${rel.following?"ghost":"primary"}" id="followUser">${rel.following?"Seguindo":"Seguir"}</button><button class="gi9915-button ghost" id="friendUser">${rel.friendship==="FRIENDS"?"Amigos":rel.friendship==="REQUEST_SENT"?"Pedido enviado":rel.friendship==="REQUEST_RECEIVED"?"Aceitar amizade":"Adicionar amigo"}</button><button class="gi9915-button ghost" id="messageUser" ${rel.friendship==="FRIENDS"?"":"hidden"}>Mensagem</button></div>
        </div>
      </section>
      <section class="gi9915-profile-section"><div class="gi9915-profile-section-head"><div><p class="gi9915-kicker">SOCIAL</p><h2>Amigos</h2></div></div><div class="gi9915-friends-strip">${friendStrip(p.friends||[])}</div></section>
      <section class="gi9915-profile-section"><div class="gi9915-profile-section-head"><div><p class="gi9915-kicker">DESTAQUES</p><h2>Jogos Favoritos</h2></div></div><div class="gi9915-game-grid">${gameGrid(p.favoriteGames||[],"Nenhum jogo favorito público.")}</div></section>
      <section class="gi9915-profile-section"><div class="gi9915-profile-section-head"><div><p class="gi9915-kicker">ACOMPANHANDO</p><h2>Jogos Seguidos</h2></div></div><div class="gi9915-game-grid">${gameGrid(p.followedGames||[],"Nenhum jogo seguido nesta lista.")}</div></section>
    `;
    const stable=targetId?`/api/users/id/${encodeURIComponent(targetId)}`:apiBase();
    $("followUser")?.addEventListener("click",async()=>{try{await GV.api(`${stable}/follow`,{method:rel.following?"DELETE":"POST"});load();}catch(e){alert(e.message);}});
    $("friendUser")?.addEventListener("click",async()=>{try{if(rel.friendship==="FRIENDS")await GV.api(`/api/friends/id/${encodeURIComponent(targetId)}`,{method:"DELETE"});else if(rel.friendship==="REQUEST_RECEIVED")await GV.api(`/api/friends/requests/${encodeURIComponent(rel.requestId)}/accept`,{method:"POST"});else if(rel.friendship==="REQUEST_SENT")return;else await GV.api(`${stable}/friend-request`,{method:"POST"});load();}catch(e){alert(e.message);}});
    $("messageUser")?.addEventListener("click",async()=>{try{const d=await GV.api("/api/social/conversations/direct",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({targetUserId:targetId})});location.href=`/social.html?conversation=${encodeURIComponent(d.conversation.id)}`;}catch(e){alert(e.message);}});
  }catch(e){box.innerHTML=`<div class="empty-state">${esc(e.message)}</div>`;}
}
addEventListener("DOMContentLoaded",load);
