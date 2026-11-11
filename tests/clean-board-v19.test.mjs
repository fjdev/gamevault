import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {masterClueCenters,masterSlotCenters} from '../games/shared/layout.js';
const source=p=>fs.readFileSync(new URL(p,import.meta.url),'utf8');
test('Five clues are staggered in a 3+2 pattern with clearance between rings',()=>{
 const pts=masterClueCenters(5,100);
 assert.equal(pts.length,5);
 assert.equal(pts.filter(p=>p.y===93).length,3);
 assert.equal(pts.filter(p=>p.y===107).length,2);
 for(let i=0;i<pts.length;i++)for(let j=i+1;j<pts.length;j++){
  assert.ok(Math.hypot(pts[i].x-pts[j].x,pts[i].y-pts[j].y)>12,`clue rings ${i} and ${j} overlap`);
 }
});
test('Four clues are in a non-overlapping 2 by 2 grid',()=>{
 const pts=masterClueCenters(4,100);
 assert.deepEqual(pts.map(p=>p.y),[93,93,107,107]);
 assert.deepEqual(masterSlotCenters(5),[49,84,119,154,189]);
});
test('Game artwork uses high-DPI vector objects and no vintage-grain pipeline',()=>{
 const photo=source('../games/shared/photo.js');
 assert.match(photo,/drawMasterPhoto/);
 assert.match(photo,/drawOthelloPhoto/);
 assert.match(photo,/drawBattlePhoto/);
 assert.doesNotMatch(photo,/imageSmoothingEnabled\s*=\s*false|putImageData|createImageData|filter\s*:/);
 assert.match(photo,/for\(const vessel of sunk\)drawSunk/);
 const sw=source('../sw.js');assert.match(sw,/game-vault-v19-clean-board-renderers/);
});
