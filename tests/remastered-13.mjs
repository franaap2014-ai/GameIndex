import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { JSDOM } from "jsdom";

const read=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");
const css=read("public/css/remastered-13.css");
const script=read("public/js/remastered-13.js");
const soundtrack=read("public/js/remastered-soundtrack.js");
const shell=read("public/js/shell-0986.js");
const legacy=read("public/js/remaster-093.js");

assert(css.includes('grid-template-columns:auto minmax(155px,1fr) auto'),'single desktop header layout');
assert(css.includes("height:78px!important"),"single fixed-height desktop header");
assert(css.includes('data-theme="free-light"'),"light mode respected");
assert(script.includes('dataset.giFramed'),"Image Manager framing is preserved");
assert(css.includes("prefers-reduced-motion"),"accessibility");
assert(!css.includes("gi13-allow-cinematic"),"do not suppress special cinematics");
assert(shell.includes("/js/remastered-13.js?v=13.1"),"remaster runtime hooked in shell");
assert(shell.includes("/js/remastered-soundtrack.js?v=13.1"),"original soundtrack loaded");
assert(!legacy.includes("groupDrawer();brand();palette();routes();opening();"),"no automatic page scene on navigation");
assert(soundtrack.includes("Constellation Gateway"),"original composition exists");
assert(soundtrack.includes("AudioContext"),"web audio composition exists");
assert(!/youtube\.com|youtu\.be|spotify\.com/.test(soundtrack),"music isn't a remote copyrighted track");
assert(!/\.play\(\)/.test(soundtrack),"audio must be user initiated");

const dom=new JSDOM(`<!doctype html><html><head></head><body data-page="home">
<header id="siteHeader"><div class="header-nav"></div><button id="menuTrigger"></button><span class="brand-badge">BETA</span></header>
<aside id="sideDrawer"><nav class="drawer-nav">
<p>Explorar</p><a href="/">Home</a><a href="/games.html">Games</a><a href="/ai.html">Dexter</a>
<p>Conta</p><a href="/login.html">Entrar</a><div id="adminPanelMenu" hidden><a href="/admin.html">Admin</a></div>
</nav><div class="drawer-footer"><span>Beta 0.992</span></div></aside>
<main class="page-wrap">
<section class="hero-home"><div class="hero-kicker">GAMEINDEX</div><h1>Old site</h1><p class="hero-copy">Old</p><div class="hero-actions"></div></section>
<section id="recommended"><p id="recommendationEyebrow">Old</p><span id="recommendationMode"></span></section>
</main></body></html>`,{url:"https://gameindex.example/",runScripts:"outside-only"});
dom.window.eval(script);
dom.window.GameIndexRemastered13.boot();
assert.equal(dom.window.document.documentElement.dataset.remaster,"13");
const portals=dom.window.document.querySelectorAll(".gi13-portal");
assert.equal(portals.length,3,"new destination cards");
assert.equal(dom.window.document.querySelectorAll("#siteHeader").length,1,"exactly one site header");
assert.equal(dom.window.document.querySelectorAll(".drawer-nav > details").length,0,"no accordion wrapper");
assert(dom.window.document.querySelector("#adminPanelMenu").hidden,"admin stays hidden");
assert.equal(dom.window.document.querySelector(".hero-home h1").textContent.includes("games."),true);
assert.equal(dom.window.document.querySelector(".gi13-portal[href='/ai.html']")?.textContent.includes("Dexter IA"),true);

// Audio script mounts into existing player without automatically starting playback.
const audio=new JSDOM(`<!doctype html><body><div id="giMusicPopover"></div></body>`,{url:"https://gameindex.example/",runScripts:"outside-only"});
audio.window.eval(soundtrack);
audio.window.document.dispatchEvent(new audio.window.Event("DOMContentLoaded"));
assert(audio.window.document.getElementById("gi13TrackToggle"),"original soundtrack control mounted");
assert.equal(audio.window.GameIndexOriginalTheme.getState().playing,false,"song idle until user clicks");
console.log("GameIndex Remastered 13 pillars: contracts passed.");
