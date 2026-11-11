import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync,readFileSync} from 'node:fs';
const path=new URL('../assets/art/v15/',import.meta.url);
const asset=n=>new URL(n,path);
test('All Mastermind manufactured plates match 4/5 socket and 8–12 row variants',()=>{
 for(const slots of [4,5])for(let rows=8;rows<=12;rows++)assert.ok(existsSync(asset(`mastermind-${slots}-${rows}.webp`)));
});
test('Othello and Battleship dynamic 3D parts and base plates are independent',()=>{
 for(const n of ['othello-base.webp','battleship-place.webp','battleship-play.webp','disc-black.png','disc-white.png',...['red','yellow','blue','green','orange','white','black','brown','purple','pink','cyan','lime'].map(c=>`peg-${c}.png`),...[2,3,4,5].map(n=>`ship-${n}.png`)])assert.ok(existsSync(asset(n)),n);
});
test('The three game renderers use 3D plates and retain pixel processing and hit mapping',()=>{
 const photo=readFileSync(new URL('../games/shared/photo.js',import.meta.url),'utf8');
 const board=readFileSync(new URL('../games/shared/boards.js',import.meta.url),'utf8');
 assert.match(photo,/finish\(canvas/);assert.match(photo,/mastermind-\$\{slots\}-\$\{maxAttempts\}/);
 assert.match(board,/drawMasterPhoto/);assert.match(board,/drawOthelloPhoto/);assert.match(board,/drawBattlePhoto/);
 assert.match(board,/export function othelloHit/);assert.match(board,/export function battleHit/);
});
