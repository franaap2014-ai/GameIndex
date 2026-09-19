import fs from "node:fs";import assert from "node:assert/strict";import path from "node:path";
const root=path.resolve(new URL("..",import.meta.url).pathname);const read=p=>fs.readFileSync(path.join(root,p),"utf8");
const shell=read("public/js/shell.js"),css=read("public/css/hotfix-0985-perf-music.css"),game=read("public/js/game.js"),html=read("public/game.html");
assert.match(shell,/event\.target\?\.closest\?\.\('#gameIndexSoundToggle'\)/,"global unlock must ignore sound button so one click cannot instantly mute itself");
assert.match(shell,/function onSoundButton\(\)/);assert.match(shell,/if\(!iframe\)\{localStorage\.setItem\(mutedKey,'0'\)/,"first sound-button click must request PLAY rather than MUTE");
assert.match(shell,/primeCurrent\(\);/);assert.match(shell,/youtube-nocookie\.com\/embed/);assert.match(shell,/controls=1/);
assert.match(css,/min-width:200px!important/);assert.match(css,/min-height:200px!important/);assert.doesNotMatch(css,/left:-10000px/);assert.doesNotMatch(css,/width:1px!important/);
assert.match(game,/function basicGameDescription/);assert.match(game,/function basicGameFacts/);assert.match(html,/id="gameBasicFacts"/);
console.log("HF5 presentation + music contract PASS");
