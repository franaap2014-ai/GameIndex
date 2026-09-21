const $=id=>document.getElementById(id),esc=v=>GV.safe(v??"");
function initials(v=""){return String(v||"GI").split(/\s+/).filter(Boolean).map(x=>x[0]).join("").slice(0,2).toUpperCase();}
function avatarUrl(p={},name="",classification="FREE"){return p.avatarDisplayUrl||p.avatarUrl||GV.autoAvatar({seed:p.userId||p.id||name,name,classification});}
function friendStrip(items=[]){
  return items.length?items.map(p=>{const name=p.displayName||p.username||"Jogador",url=avatarUrl(p,name,p.badge||p.staffRole||"FREE");return `<a class="gi9915-friend" href="/user.html?id=${encodeURIComponent(p.userId||p.id)}"><span class="gi9915-friend-avatar"><img src="${esc(url)}" alt="${esc(name)}" loading="lazy"></span><strong>${esc(name)}</strong></a>`;}).join(""):'<div class="gi9915-social-empty">Adicione amigos para vê-los aqui.</div>';
}
function gameGrid(items=[],empty){
  return items.length?items.map(g=>`<a class="gi9915-game-tile" href="/game.html?slug=${encodeURIComponent(g.slug)}"><strong>${esc(g.nome||g.name)}</strong><small>${esc(g.franquia||g.desenvolvedor||g.developer||"GameIndex")}</small></a>`).join(""):`<div class="gi9915-social-empty">${esc(empty)}</div>`;
}
async function init(){
  const view=$("profileView");
  try{
    const p=await GV.api("/api/profile"),s=p.socialProfile||{},user=p.user||{},name=s.displayName||user.displayName||"Jogador",identity=user.staffRole&&user.staffRole!=="NONE"?user.staffRole:(user.accountTier||user.badge||"FREE"),avatar=avatarUrl(s,name,identity);
    view.className="gi9915-page";
    view.innerHTML=`
      <section class="gi9915-profile-hero">
        <div class="gi9915-profile-avatar"><img src="${esc(avatar)}" alt="${esc(name)}"></div>
        <div>
          <p class="gi9915-kicker">PERFIL</p>
          <div class="gi9915-profile-title"><h1>${esc(name)}</h1>${user.badge&&user.badge!=="FREE"?`<span class="trace-pill ok">${esc(user.badge)}</span>`:""}</div>
          <p class="gi9915-profile-handle">@${esc(s.username||"")}</p>
          ${s.bio?`<p>${esc(s.bio)}</p>`:""}
          <div class="gi9915-profile-counts">
            <span><strong>${Number(p.counts?.friends||0)}</strong> Amigos</span>
            <span><strong>${Number(p.counts?.followers||0)}</strong> Seguidores</span>
            <span><strong>${Number(p.counts?.following||0)}</strong> Seguindo</span>
            <span><strong>${Number(p.counts?.followedGames||0)}</strong> Jogos seguidos</span>
          </div>
          <div class="gi9915-profile-actions"><a class="gi9915-button primary" href="/profile-settings.html">Editar perfil</a><button class="gi9915-button ghost" id="profileLogout" type="button">Sair</button></div>
        </div>
      </section>

      <section class="gi9915-profile-section"><div class="gi9915-profile-section-head"><div><p class="gi9915-kicker">SOCIAL</p><h2>Amigos</h2></div></div><div class="gi9915-friends-strip">${friendStrip(p.friends||[])}</div></section>
      <section class="gi9915-profile-section"><div class="gi9915-profile-section-head"><div><p class="gi9915-kicker">SEUS JOGOS</p><h2>Jogos Favoritos</h2></div></div><div class="gi9915-game-grid">${gameGrid(p.favoriteGames||[],"Seus jogos favoritos vão aparecer aqui.")}</div></section>
      <section class="gi9915-profile-section"><div class="gi9915-profile-section-head"><div><p class="gi9915-kicker">ACOMPANHANDO</p><h2>Jogos Seguidos</h2></div></div><div class="gi9915-game-grid">${gameGrid(p.followedGames||[],"Você ainda não segue nenhum jogo.")}</div></section>
    `;
    $("profileLogout")?.addEventListener("click",async()=>{await GV.api("/api/auth/logout",{method:"POST"});location.href="/";});
  }catch(error){
    view.innerHTML=`<section class="simple-hero centered"><p class="section-eyebrow">PERFIL</p><h1>Faça login para abrir seu perfil.</h1><p>${esc(error.message)}</p><a class="button primary-button" href="/login.html">Login</a></section>`;
  }
}
addEventListener("DOMContentLoaded",init);
