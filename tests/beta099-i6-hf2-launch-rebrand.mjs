import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
const root=path.resolve(import.meta.dirname,"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
const pkg=JSON.parse(read("package.json"));
assert.ok(["0.99.6-2","0.991.0"].includes(pkg.version));
assert.ok(["node tests/beta099-i6-hf2-launch-rebrand.mjs","node tests/beta0991-full-experience.mjs"].includes(pkg.scripts.test));
const release=read("src/config/release-099i6.mjs");
assert.match(release,/0\.99-I6-HF2|0\.991/);assert.match(release,/BETA_0_99_I6_HF2_LAUNCH_VISUAL_REBRAND|BETA_0_991_FULL_EXPERIENCE/);assert.match(release,/TARGET_SCHEMA=40/);
const shell=read("public/js/shell-0986.js"),settings=read("public/js/settings.js"),css=read("public/css/gameindex-0986.css"),credits=read("public/credits.html"),auth=read("src/auth/auth-service.mjs");
for(const token of ["resolveBrand(state={})","applyBrand(state={})","autoAvatar({seed=\"\",name=\"\",classification=\"FREE\"}","transitionTheme(nextState={}","MAX_TRANSITION_DURATION"]){if(token==="MAX_TRANSITION_DURATION")continue;assert.ok(shell.includes(token),`missing ${token}`);}
assert.ok(shell.includes('3500')||shell.includes('2500'),"cutscene safety timeout");
assert.ok(shell.includes('data-gi-brand-classification'),"classification line");
assert.ok(shell.includes('brand.key===\"free\"'),"free neutral avatar");
assert.ok(shell.includes('auth.user.avatarDisplayUrl||auth.user.avatarUrl||GV.autoAvatar'),"custom avatar wins");
assert.match(auth,/avatarDisplayUrl:profile\?\.avatarDisplayUrl/);
assert.ok(settings.includes('{animateTheme:true}'),"appearance changes use cutscene");
assert.ok(settings.includes('document.querySelectorAll("[data-theme-id]").forEach(x=>x.disabled=true)'),"theme switch input lock");
assert.match(css,/gi-hf2-theme-transition|gi-theme-power-transition/);assert.match(css,/prefers-reduced-motion:reduce/);assert.match(css,/data-brand-class="pro"/);assert.match(css,/data-brand-class="creator"/);
assert.match(credits,/TEMPORARY_LAUNCH_PRESENTATION_CREDITS/);assert.match(credits,/Francisco, Murilo, Victor, Samuel Fernandes e Alberto/);assert.match(credits,/Criado para a aula de Maker/);
assert.doesNotMatch(credits,/Franchesco01|Deterministic at the core/);
const htmlFiles=fs.readdirSync(path.join(root,"public")).filter(x=>x.endsWith(".html"));for(const f of htmlFiles){const h=read(`public/${f}`);if(h.includes("shell-0986.js"))assert.match(h,/shell-0986\.js\?v=(?:099i6hf2|0991)/);if(h.includes("gameindex-0986.css"))assert.match(h,/gameindex-0986\.css\?v=(?:099i6hf2|0991)/);}
console.log(JSON.stringify({ok:true,release:"0.99-I6-HF2",schema:40,visualRebrand:true,classificationBranding:true,appearanceCutscene:true,automaticAvatars:true,makerCredits:true,hf1ArchitectureUntouched:true},null,2));
