/* GAMEINDEX REMASTERED — ORIGINAL SOUNDTRACK
 * "Constellation Gateway" · original WebAudio composition written for GameIndex.
 * No recordings, copyrighted samples, remote streams or external APIs.
 * Playback is user-initiated to respect browser autoplay policies. */
(()=>{
"use strict";
if(window.GameIndexOriginalTheme)return;
const STORE=window.GIStorage?.local||{getItem:()=>null,setItem:()=>{}};
const A=globalThis.AudioContext||globalThis.webkitAudioContext;
let ctx=null,volume=null,playing=false,nextBar=0,bar=0,clock=null,active=[];
const beat=60/86,barDuration=beat*4;
const chords=[
 [48,55,60,63], // Cm(add9)
 [44,51,56,60], // Abmaj7
 [51,58,63,67], // Ebmaj7
 [46,53,58,62], // Bb(add9)
 [48,55,60,63], // Cm(add9)
 [44,51,56,60,63], // Abmaj9
 [53,60,65,68], // Fm(add9)
 [46,53,58,62] // Bb(add9)
];
const melody=[
 [72,null,75,77,75,null,70,72],
 [68,null,72,75,72,null,68,67],
 [70,72,75,null,77,75,72,null],
 [74,null,77,75,74,70,72,null],
 [75,null,79,77,75,72,70,null],
 [72,75,80,null,79,75,72,null],
 [68,null,72,75,77,75,72,68],
 [70,72,74,null,77,75,72,null]
];
const midi=n=>440*Math.pow(2,(n-69)/12);
function synth(note,start,duration,type,amp,attack,release,cutoff=1600,detune=0){
  if(!ctx||!volume)return;
  const osc=ctx.createOscillator(),gain=ctx.createGain(),filter=ctx.createBiquadFilter();
  osc.type=type;osc.frequency.setValueAtTime(midi(note),start);osc.detune.value=detune;
  filter.type="lowpass";filter.frequency.setValueAtTime(cutoff,start);filter.Q.value=.6;
  gain.gain.setValueAtTime(0,start);
  gain.gain.linearRampToValueAtTime(amp,start+attack);
  gain.gain.setTargetAtTime(amp*.6,start+attack,Math.max(.1,duration*.26));
  gain.gain.setTargetAtTime(.0001,start+duration,release);
  osc.connect(filter);filter.connect(gain);gain.connect(volume);
  osc.start(start);osc.stop(start+duration+Math.max(.5,release*7));
  active.push(osc);
}
function addBar(index,start){
  const n=index%8,c=chords[n];
  // Three voicings make a warm, slowly changing digital space.
  for(let i=1;i<c.length;i++){
    synth(c[i],start,barDuration-.16,"sine",.032,.33,.65,1300,-3);
    synth(c[i]-12,start,barDuration-.16,"triangle",.012,.52,.5,660,2);
  }
  // Bass, soft pulsing rhythmic pattern.
  for(let b=0;b<4;b++){
    synth(c[0]-12,start+b*beat,beat*.78,"sine",b===0?.17:.083,.02,.20,320);
    if(b===0||b===2)synth(c[0],start+b*beat,beat*.12,"triangle",.017,.004,.08,760);
  }
  // 8 step lead phrase with delicately layered plucks.
  for(let step=0;step<8;step++){
    const note=melody[n][step];
    if(note==null)continue;
    const time=start+step*beat/2;
    synth(note,time,beat*.52,"sine",.065,.025,.25,2450);
    synth(note+12,time,beat*.16,"triangle",.008,.006,.09,3600,4);
  }
  // One very quiet high signal at start of each two-bar section.
  if(n%2===0)synth(84,start+.035,beat*.72,"sine",.022,.12,.38,4200);
}
function pump(){
  if(!ctx||!playing)return;
  while(nextBar<ctx.currentTime+4*barDuration){
    addBar(bar,nextBar);nextBar+=barDuration;bar++;
  }
  if(active.length>800)active=active.filter(node=>node.context?.state!=="closed").slice(-500);
}
async function start(){
  if(!A)throw new Error("Seu navegador não oferece áudio WebAudio.");
  if(!ctx){ctx=new A();volume=ctx.createGain();volume.connect(ctx.destination);
    const stored=Number(STORE.getItem("gi13_track_volume"));volume.gain.value=Number.isFinite(stored)&&stored>=0&&stored<=100?stored/100*.36:.095;
  }
  if(ctx.state==="suspended")await ctx.resume();
  if(playing)return;
  playing=true;nextBar=ctx.currentTime+.08;
  pump();clock=setInterval(pump,Math.max(800,Math.floor(barDuration*1000/2)));
  reflect();
}
function stop(){
  playing=false;clearInterval(clock);clock=null;
  for(const o of active){try{o.stop();}catch{}}
  active=[];
  if(ctx&&ctx.state==="running")ctx.suspend().catch(()=>{});
  reflect();
}
function setVolume(value){
  const n=Math.max(0,Math.min(100,Number(value)||0));
  STORE.setItem("gi13_track_volume",String(n));
  if(volume&&ctx)volume.gain.setTargetAtTime(n/100*.36,ctx.currentTime,.06);
}
function reflect(){
  const button=document.getElementById("gi13TrackToggle"),status=document.getElementById("gi13TrackStatus");
  if(button){button.textContent=playing?"❚❚ Pausar":"▶ Reproduzir";button.setAttribute("aria-pressed",String(playing));}
  if(status)status.textContent=playing?"Trilha original em reprodução · loop de 8 compassos":"Reprodução manual, sem anúncios nem serviços externos";
}
function mount(){
  const pop=document.getElementById("giMusicPopover");
  if(!pop||pop.querySelector("#gi13OriginalTrack"))return;
  const panel=document.createElement("section");
  panel.id="gi13OriginalTrack";panel.className="gi13-track";
  panel.innerHTML='<div class="gi13-track-head"><span>♫</span><strong>CONSTELLATION GATEWAY</strong><span>ORIGINAL</span></div>'+
    '<div class="gi13-track-controls"><button type="button" id="gi13TrackToggle" aria-pressed="false">▶ Reproduzir</button><input id="gi13TrackVolume" aria-label="Volume da trilha original" type="range" min="0" max="100" value="26"></div>'+
    '<small class="gi13-track-status" id="gi13TrackStatus">Trilha original do GameIndex · clique em reproduzir</small>';
  pop.append(panel);
  const button=document.getElementById("gi13TrackToggle");
  button.addEventListener("click",async()=>{
    try{if(playing)stop();else await start();}
    catch(error){document.getElementById("gi13TrackStatus").textContent=error?.message||"Áudio indisponível";}
  });
  const range=document.getElementById("gi13TrackVolume");
  const stored=Number(STORE.getItem("gi13_track_volume"));
  if(Number.isFinite(stored)&&stored>=0&&stored<=100)range.value=String(stored);
  range.addEventListener("input",()=>setVolume(range.value));
  document.addEventListener("visibilitychange",()=>{if(document.hidden&&playing)stop();});
}
window.GameIndexOriginalTheme=Object.freeze({start,stop,setVolume,getState:()=>({playing,volume:volume?.gain?.value??0,tempo:86,loopBars:8,title:"Constellation Gateway"})});
window.addEventListener("gv:shell-ready",mount);
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",mount,{once:true});else mount();
})();
