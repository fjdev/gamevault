import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {pointerPos,mastermindHit,battleHit,BATTLE_TARGET,othelloHit} from '../games/shared/boards.js';
const src=p=>fs.readFileSync(new URL(p,import.meta.url),'utf8');
test('Hi-density canvas maps CSS pointer positions to the original logical grid',()=>{
 const canvas={width:640,height:668,getBoundingClientRect:()=>({left:25,top:30,width:320,height:334})};
 const a=pointerPos({clientX:25+24+34*2+17,clientY:30+30+34*4+17},canvas);
 assert.equal(othelloHit(a.x,a.y),34);
 const b=pointerPos({clientX:25+35+25*4+12.5,clientY:30+59+25*5+12.5},canvas);
 assert.equal(battleHit(b.x,b.y,BATTLE_TARGET),54);
 const c=pointerPos({clientX:25+68,clientY:30+58+28*2},canvas);
 assert.equal(mastermindHit(c.x,c.y,{settings:{slots:4},history:[{},{}]}),0);
});
test('Boards no longer use destructive 60% reduction or nearest neighbour upscale',()=>{
 const boards=src('../games/shared/boards.js'),style=src('../games/shared/ui.css');
 assert.doesNotMatch(boards,/work\.width=Math\.round\(w\*\.60\)/);
 assert.match(boards,/canvas instanceof HTMLCanvasElement\?2:1/);
 assert.match(style,/\.pixel-board[^\n]*image-rendering:auto!important/);
});
test('Animated corridor uses mipmaps against false moire bands',()=>{
 const dungeon=src('../dungeon.js');
 assert.match(dungeon,/gl\.LINEAR_MIPMAP_LINEAR/);
 assert.match(dungeon,/gl\.generateMipmap/);
 assert.match(dungeon,/const W=360,H=600/);
});
