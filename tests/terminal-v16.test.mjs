import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {sunkShips,fire} from '../games/battleship/engine.js';
import {COLORS} from '../games/mastermind/engine.js';
import {initialBoard,legalMoves,makeMove,finished} from '../games/othello/engine.js';

let sequence=200;
async function bootSaved(kind,state){
 const key=`game-vault-${kind}-remake-v11`,store=new Map([[key,JSON.stringify(state)]]),listeners=new Map();
 const app={innerHTML:'',addEventListener:(name,fn)=>listeners.set(name,fn),querySelector:()=>null};
 globalThis.document={querySelector:s=>s==='#app'?app:null,body:{dataset:{game:kind}},addEventListener:()=>{}};
 globalThis.localStorage={getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,v)};
 await import(`../games/${kind}/app.js?test-v16-${++sequence}`);
 return {app,store,act:(name,val)=>{const el={dataset:{act:name,val},closest:sel=>sel==='[data-act]'?el:null};listeners.get('click')({target:el})}};
}
const shots=()=>Array(100).fill(0);
const ship=(name,cells)=>({name,size:cells.length,cells});
const player=(ships,aim=shots())=>({sea:Array(100).fill(-1),ships,placements:Array(5).fill(null),shots:aim});

test('All twelve Mastermind colors exist and can be configured',async()=>{
 assert.equal(COLORS.length,12);
 assert.equal(new Set(COLORS.map(c=>c.id)).size,12);
 for(const name of ['purple','pink','cyan','lime'])assert.ok(COLORS.some(c=>c.id===name));
 const cfg={slots:4,colorCount:12,maxAttempts:10,repeats:false};
 const game={settings:cfg,phase:'breaker',secret:['red','pink','cyan','lime'],draft:[null,null,null,null],history:[],selected:0,edits:[],mode:'solo'};
 const h=await bootSaved('mastermind',{screen:'play',mode:'solo',config:cfg,game});
 assert.equal((h.app.innerHTML.match(/class="color-btn"/g)||[]).length,12);
 assert.match(h.app.innerHTML,/>Cyan</);assert.match(h.app.innerHTML,/>Lime</);
});

test('Mastermind finish preserves the final attempt board, the secret and review action',async()=>{
 const cfg={slots:4,colorCount:12,maxAttempts:10,repeats:false};
 const game={settings:cfg,phase:'complete',secret:['pink','lime','cyan','purple'],draft:[null,null,null,null],history:[{guess:['pink','lime','cyan','purple'],black:4,white:0}],selected:0,edits:[],finished:true};
 const h=await bootSaved('mastermind',{screen:'result',mode:'solo',config:cfg,game});
 assert.match(h.app.innerHTML,/Final mastermind board/);assert.match(h.app.innerHTML,/CODE BROKEN/);assert.match(h.app.innerHTML,/SECRET CODE/);
 h.act('home');assert.match(h.app.innerHTML,/REVIEW FINAL BOARD/);
 h.act('resume');assert.match(h.app.innerHTML,/Final mastermind board/);
});

test('Othello finish retains all pieces in a non-interactive canvas and resumes to review',async()=>{
 const board=Array.from({length:64},(_,i)=>i%3===0?-1:1);
 const h=await bootSaved('othello',{screen:'result',mode:'local',difficulty:'normal',game:{board,turn:1,selected:null,history:Array(56).fill({pos:0}),finished:true}});
 assert.match(h.app.innerHTML,/Final othello board/);assert.match(h.app.innerHTML,/DARK WINS/);
 h.act('home');assert.match(h.app.innerHTML,/REVIEW FINAL BOARD/);
 h.act('resume');assert.match(h.app.innerHTML,/Final othello board/);
});

test('Only completely hit ships count as sunk; sunk mark persists after follow-up misses',()=>{
 const ships=[ship('Destroyer',[1,2]),ship('Submarine',[20,30,40])];
 const sea=Array(100).fill(-1);for(let j=0;j<ships.length;j++)for(const i of ships[j].cells)sea[i]=j;
 const enemy={sea,ships};
 let state=shots();state=fire(enemy,state,1).shots;
 assert.equal(sunkShips(ships,state).length,0);
 let hit=fire(enemy,state,2);state=hit.shots;assert.equal(hit.sunk,true);
 assert.deepEqual(sunkShips(ships,state).map(s=>s.name),['Destroyer']);
 state=fire(enemy,state,99).shots;assert.deepEqual(sunkShips(ships,state).map(s=>s.name),['Destroyer']);
});

test('Battleship end state keeps both seas; only at end are other ships revealed',async()=>{
 const humanShips=[ship('Destroyer',[0,1])],enemyShips=[ship('Destroyer',[10,11])];
 const hit=shots();hit[10]=2;hit[11]=2;
 const game={players:[player(humanShips,hit),player(enemyShips)],active:0,winner:0,pendingShot:null,proposal:null,sunkNotice:{ship:'Destroyer',side:'enemy',pos:11},last:{sunk:true,ship:'Destroyer'},afterPass:'turn'};
 const h=await bootSaved('battleship',{screen:'result',mode:'solo',difficulty:'normal',game});
 assert.match(h.app.innerHTML,/Final battleship board/);assert.match(h.app.innerHTML,/ENEMY SHIP SUNK/);assert.match(h.app.innerHTML,/VICTORY/);
 h.act('home');assert.match(h.app.innerHTML,/REVIEW FINAL BOARD/);
 h.act('resume');assert.match(h.app.innerHTML,/Final battleship board/);
 const app=fs.readFileSync(new URL('../games/battleship/app.js',import.meta.url),'utf8');
 assert.match(app,/revealTargets:S\.screen==='result'/);
 const art=fs.readFileSync(new URL('../games/shared/photo.js',import.meta.url),'utf8');
 assert.match(art,/for\(const vessel of sunk\)drawSunk/);
});

test('Every game uses the Vault typeface and common corridor renderer',()=>{
 const style=fs.readFileSync(new URL('../games/shared/ui.css',import.meta.url),'utf8');
 assert.match(style,/font-family:VaultPixel,'Courier New',monospace/);
 assert.match(style,/\.corridor-backdrop/);
 for(const name of ['mastermind','othello','battleship']){
  const html=fs.readFileSync(new URL(`../games/${name}/index.html`,import.meta.url),'utf8');
  assert.match(html,/shared\/scene\.js/);
 }
 const scene=fs.readFileSync(new URL('../games/shared/scene.js',import.meta.url),'utf8');
 assert.match(scene,/startDungeon/);
});

test('Mastermind winning a real local game transitions to the still-visible board',async()=>{
 const config={slots:4,colorCount:12,maxAttempts:10,repeats:false};
 const h=await bootSaved('mastermind',{screen:'home',mode:'local',config,game:null});
 h.act('mode','local');h.act('start');
 for(const color of ['cyan','lime','pink','purple'])h.act('color',color);
 h.act('seal');h.act('ready');
 for(const color of ['cyan','lime','pink','purple'])h.act('color',color);
 h.act('guess');
 const state=JSON.parse(h.store.get('game-vault-mastermind-remake-v11'));
 assert.equal(state.screen,'result');assert.equal(state.game.finished,true);
 assert.match(h.app.innerHTML,/Final mastermind board/);
});

test('Othello final legal move transitions to a visible final board',async()=>{
 let board=initialBoard(),turn=1,last=null;
 for(let n=0;n<65;n++){
  let moves=legalMoves(board,turn);
  if(!moves.length){turn=-turn;moves=legalMoves(board,turn)}
  if(!moves.length)break;
  const pos=moves[0],next=makeMove(board,pos,turn).board;
  if(finished(next)){last={board:board.slice(),turn,pos};break}
  board=next;turn=-turn;
 }
 assert.ok(last,'should find a terminal legal move');
 const h=await bootSaved('othello',{screen:'play',mode:'local',difficulty:'normal',game:{board:last.board,turn:last.turn,selected:last.pos,history:[]}});
 h.act('confirm');
 const state=JSON.parse(h.store.get('game-vault-othello-remake-v11'));
 assert.equal(state.screen,'result');assert.equal(state.game.finished,true);
 assert.match(h.app.innerHTML,/Final othello board/);
});

test('Battleship last confirmed hit leads to final two-grid view',async()=>{
 const enemyShips=[ship('Carrier',[0,1,2,3,4]),ship('Battleship',[10,11,12,13]),ship('Submarine',[20,21,22]),ship('Patrol boat',[30,31,32]),ship('Destroyer',[40,41])];
 const enemy=player(enemyShips);for(let i=0;i<enemyShips.length;i++)for(const c of enemyShips[i].cells)enemy.sea[c]=i;
 const attacker=player([ship('Carrier',[50,51,52,53,54])]);
 for(const ship of enemyShips)for(const c of ship.cells)if(c!==41)attacker.shots[c]=2;
 const g={players:[attacker,enemy],active:0,selectedShip:0,vertical:false,proposal:null,pendingShot:41,winner:null,last:null,sunkNotice:null,afterPass:'turn'};
 const h=await bootSaved('battleship',{screen:'turn',mode:'local',difficulty:'normal',game:g});
 h.act('confirm-shot');
 const state=JSON.parse(h.store.get('game-vault-battleship-remake-v11'));
 assert.equal(state.screen,'result');assert.equal(state.game.winner,0);
 assert.match(h.app.innerHTML,/Final battleship board/);
 assert.match(h.app.innerHTML,/ENEMY SHIP SUNK/);
});
