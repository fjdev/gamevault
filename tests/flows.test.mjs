import test from 'node:test';
import assert from 'node:assert/strict';

// Minimal DOM harness exercises user actions without relying on the blocked GUI browser.
let sequence=0;
async function boot(game){
 const store=new Map(),listeners=new Map(),documentListeners=new Map();const app={innerHTML:'',addEventListener:(name,fn)=>listeners.set(name,fn),querySelector:()=>null};
 globalThis.document={querySelector:(s)=>s==='#app'?app:null,body:{dataset:{game}},addEventListener:(s,fn)=>documentListeners.set(s,fn)};
 globalThis.localStorage={getItem:key=>store.get(key)??null,setItem:(key,val)=>store.set(key,val)};
 await import(`../games/${game}/app.js?unique=${++sequence}`);
 function act(name,value){const elt={dataset:{act:name,val:value},closest:sel=>sel==='[data-act]'?elt:null};listeners.get('click')({target:elt})}
 function tap(x,y,width=320,height=700){const board={width,height,getBoundingClientRect:()=>({left:0,top:0,width,height})};const elt={closest:sel=>sel==='[data-act]'?null:sel==='#board'?board:null};listeners.get('click')({target:elt,clientX:x,clientY:y})}
 const get=()=>JSON.parse([...store.values()].find(v=>v.includes('"screen"')));
 return {app,act,tap,get,store};
}
test('Mastermind setup includes every user parameter and prevents impossible repeat-free rules',async()=>{
 const h=await boot('mastermind');
 assert.match(h.app.innerHTML,/SELECT MODE/);assert.doesNotMatch(h.app.innerHTML,/id="board"/);
 h.act('mode','solo');assert.match(h.app.innerHTML,/GAME SETTINGS/);
 h.act('setting-colorCount','4');h.act('setting-slots','5');
 let s=h.get();assert.equal(s.config.slots,5);assert.equal(s.config.colorCount,4);assert.equal(s.config.repeats,true);
 assert.match(h.app.innerHTML,/requires repeats/);
 h.act('setting-colorCount','8');h.act('toggle-repeats');s=h.get();assert.equal(s.config.repeats,false);
 h.act('setting-maxAttempts','8');h.act('start');s=h.get();assert.equal(s.screen,'play');assert.equal(s.game.settings.maxAttempts,8);
 h.act('color','white');h.act('color','red');s=h.get();assert.equal(s.game.draft.filter(Boolean).length,2);
 h.act('undo');s=h.get();assert.equal(s.game.draft.filter(Boolean).length,1);
});
test('Othello selection is provisional until CONFIRM MOVE',async()=>{
 const h=await boot('othello');h.act('mode','local');h.act('start');
 let s=h.get();assert.equal(s.game.board.filter(Boolean).length,4);
 // D3 (row 2, col 3) is a valid initial move for black (array pos19).
 h.tap(24+3*34+17,30+2*34+17,320,334);s=h.get();assert.equal(s.game.selected,19);assert.equal(s.game.board.filter(Boolean).length,4);
 h.act('confirm');s=h.get();assert.equal(s.game.board.filter(Boolean).length,5);
 assert.equal(s.game.turn,-1);assert.equal(s.screen,'play');
});
test('Battleship random fleet, editable placements, reversible targeting and FIRE',async()=>{
 const h=await boot('battleship');h.act('mode','solo');h.act('start');
 assert.equal(h.get().screen,'place');h.act('random');let s=h.get();assert.equal(s.game.players[0].ships.length,5);
 h.act('ship','0');h.act('remove');s=h.get();assert.equal(s.game.players[0].ships.length,4);
 // Restore a fully valid fleet, and enter a battle.
 h.act('random');h.act('fleet');s=h.get();assert.equal(s.screen,'turn');
 h.tap(35+4*25+12,59+4*25+12,320,652);s=h.get();assert.equal(s.game.pendingShot,44);assert.equal(s.game.players[0].shots[44],0);
 h.act('clear-shot');s=h.get();assert.equal(s.game.pendingShot,null);assert.equal(s.game.players[0].shots[44],0);
 h.tap(35+4*25+12,59+4*25+12,320,652);h.act('confirm-shot');s=h.get();assert.equal(s.game.players[0].shots[44]>0,true);
});
