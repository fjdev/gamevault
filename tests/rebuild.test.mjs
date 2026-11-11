import test from 'node:test';
import assert from 'node:assert/strict';
import {COLORS,createSecret,scoreGuess} from '../games/mastermind/engine.js';
import {initialBoard,legalMoves,makeMove} from '../games/othello/engine.js';
import {FLEET,randomFleet,fire,emptySea} from '../games/battleship/engine.js';
import {reconstruct,validProposal,placementsFromShips} from '../games/battleship/placement.js';
import {MASTER_X,M_ROW_Y,mastermindHit,OTHELLO_GRID,othelloHit,BATTLE_PLACE,BATTLE_TARGET,battleHit,drawMastermind,drawOthello,drawBattleship} from '../games/shared/boards.js';
import {cameraDistance,LOOP_SECONDS,stationAt,corridorGeometry} from '../dungeon.js';
import fs from 'node:fs';
const sample=(x,y,cell)=>({x:x+cell*.5,y:y+cell*.5});
test('Mastermind accepts custom 4–5 slots, 4–12 colors, 8–12 turns and both repeat states',()=>{
 for(const slots of [4,5])for(let colors=4;colors<=12;colors++)for(const turns of [8,9,10,11,12])for(const repeats of [false,true]){
  if(!repeats&&colors<slots){assert.throws(()=>createSecret({slots,colorCount:colors,repeats}),RangeError);continue}
  const s=createSecret({slots,colorCount:colors,maxAttempts:turns,repeats});assert.equal(s.length,slots);
  assert.equal(s.every(id=>COLORS.slice(0,colors).map(c=>c.id).includes(id)),true);
  if(!repeats)assert.equal(new Set(s).size,slots);
 }
 assert.deepEqual(scoreGuess(['white','red','blue','green'],['red','white','green','blue']),{black:0,white:4});
});
test('One geometric contract anchors Mastermind sockets 4/5, all rows 8–12',()=>{
 for(const slots of [4,5])for(let turns=8;turns<=12;turns++){
  const game={settings:{slots,maxAttempts:turns},history:Array(3).fill({guess:Array(slots).fill('red'),black:1,white:1})};
  for(let j=0;j<slots;j++){
   const center={x:MASTER_X(slots)[j],y:M_ROW_Y(3)};
   assert.equal(mastermindHit(center.x,center.y,game),j);
  }
  assert.equal(mastermindHit(320,10,game),null);
 }
});
test('Othello selects a legal cell and applies a single confirmed move',()=>{
 const board=initialBoard(),legal=legalMoves(board,1);
 assert.equal(legal.length,4);
 for(const pos of legal){const {x,y,cell}=OTHELLO_GRID;const p=sample(x+(pos%8)*cell,y+Math.floor(pos/8)*cell,cell);assert.equal(othelloHit(p.x,p.y),pos);}
 const before=board.slice(),move=makeMove(board,legal[0],1);assert.ok(move);assert.deepEqual(board,before);assert.equal(move.board.filter(v=>v===1).length,4);
});
test('Battleship whole-ship placement and grid hit mapping',()=>{
 for(const g of [BATTLE_PLACE,BATTLE_TARGET])for(let i=0;i<100;i++){
  const q=sample(g.x+(i%10)*g.cell,g.y+Math.floor(i/10)*g.cell,g.cell);assert.equal(battleHit(q.x,q.y,g),i);
 }
 const p=Array(5).fill(null);assert.ok(validProposal(p,0,0,false));p[0]={start:0,vertical:false};
 assert.equal(validProposal(p,1,1,false),false);
 assert.ok(validProposal(p,1,20,true));p[1]={start:20,vertical:true};const fleet=reconstruct(p);
 assert.deepEqual(fleet.ships.map(s=>s.size),[5,4]);assert.ok(fleet.ships[1].cells.every(i=>i%10===0));
 const generated=randomFleet(),rebuilt=reconstruct(placementsFromShips(generated.ships));assert.deepEqual(generated,rebuilt);
});
test('Shots are reversible until fire() is called by the UI',()=>{const f=randomFleet(),shots=Array(100).fill(0);const aim=3;assert.equal(shots[aim],0);const fireResult=fire(f,shots,aim);assert.ok(fireResult);assert.equal(shots[aim],0);assert.ok(fireResult.shots[aim]);assert.equal(fire(f,fireResult.shots,aim),null)});
test('Continuous camera: no 15fps quantization or loop reset, constant velocity across old boundary',()=>{
 const a=cameraDistance(0),b=cameraDistance(0.017),end=cameraDistance(LOOP_SECONDS),beyond=cameraDistance(LOOP_SECONDS+.017);
 assert.ok(b>a && b-a<.1);assert.ok(end>a);assert.ok(beyond>end);
 assert.ok(Math.abs((beyond-end)-(b-a))<1e-9)
});
test('Single UI stylesheet; home views do not render game boards',()=>{
 for(const game of ['mastermind','othello','battleship']){
  const html=fs.readFileSync(new URL(`../games/${game}/index.html`,import.meta.url),'utf8');
  assert.match(html,/shared\/ui.css/);
  assert.doesNotMatch(html,/physical.css|retro.css|v8.css/);
 }
 const shared=fs.readFileSync(new URL('../games/shared/ui.js',import.meta.url),'utf8');
 assert.match(shared,/tabletop-v15.webp/);assert.doesNotMatch(shared,/sigil.png/);assert.doesNotMatch(shared,/heroBoard/);
});
test('Renderers paint canvases of bounded dimensions without overlays',async()=>{
 const {Canvas}=await import('/opt/nvm/versions/node/v22.16.0/lib/node_modules/skia-canvas/lib/index.js');
 const a=new Canvas(320,800);drawMastermind(a,{settings:{slots:5,colorCount:8,maxAttempts:12},history:[],draft:Array(5).fill(null),secret:[],selected:0,phase:'breaker'});assert.equal(a.width,320);assert.equal(a.height,432);
 const b=new Canvas(320,800);drawOthello(b,{board:initialBoard(),turn:1,selected:null,legal:legalMoves(initialBoard(),1)});assert.equal(b.height,334);
 const d=new Canvas(320,800);drawBattleship(d,{phase:'turn',ownShips:randomFleet().ships});assert.equal(d.height,652);
 assert.ok((await d.toBuffer('png')).length>1000);
});

test('Six irregular corridor bays use three actual architectural sprites with monotone world coordinates',()=>{
 const stations=Array.from({length:18},(_,i)=>stationAt(i));
 assert.equal(new Set(stations.map(s=>s.kind)).size,3);
 assert.ok(stations.every((station,i)=>i===0||station.z>stations[i-1].z));
 const spacings=stations.slice(1).map((station,i)=>Math.round((station.z-stations[i].z)*10));
 assert.ok(new Set(spacings).size>=3);
 const past=corridorGeometry(7.2),future=corridorGeometry(7.25);
 assert.ok(future.camera>past.camera);
 assert.ok(future.stations.length>0);
 for(const kind of ['corridor-arch-v7.png','corridor-arch-b.png','corridor-arch-c.png','floor-flagstone.png','ceiling-flagstone.png','wall-masonry-clean.png']){
  assert.ok(fs.existsSync(new URL(`../assets/art/${kind}`,import.meta.url)),kind);
 }
});

test('The passage alternates actual torch light sources with darkness, without collapsing to a repetitive loop',()=>{
 const stations=Array.from({length:8},(_,i)=>stationAt(i));
 assert.deepEqual(stations.map(s=>s.torch),[1,0,2,0,3,0,1,0]);
 assert.ok(stations.every(s=>s.z>0));
 assert.ok(new Set(stations.map(s=>s.z-stations[0].z)).size>6);
 assert.equal(corridorGeometry(0).visibility,36);
});
test('Single vintage board palette: v13 studio treatment and authentic physical references are shared',()=>{
 const source=fs.readFileSync(new URL('../games/shared/boards.js',import.meta.url),'utf8');
 assert.match(source,/SUPER MASTER MIND/);
 assert.match(source,/OTHELLO|Othello/);
 assert.match(source,/MILTON BRADLEY 1990/);
 assert.match(source,/studioFinish\(canvas/);
 assert.doesNotMatch(source,/gem-mastermind|fantasy-ship|medieval-board/);
});
