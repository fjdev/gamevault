/* Game Vault v19 — CLEAN INTERACTIVE BOARD ART.
   Intentionally render all gameplay geometry at display DPI using the stable
   320-unit game coordinate system. No low-res captures, image quantization,
   stochastic noise, scanlines, blur, halftone, vignette or dirty film treatment.
   The original v15 plate assets remain in the package for archival/cover use;
   historical names include mastermind-${slots}-${maxAttempts}.
*/
import {masterClueCenters,masterSlotCenters,masterRowY} from './layout.js';
const INK='#f2ead5', LIGHT='#f9edcf';
const COLORS={
 white:['#ffffff','#f1ebdc','#c0b8a8'],black:['#748086','#242b31','#0d1116'],
 red:['#ffb1a1','#db5148','#80271f'],yellow:['#fff6b8','#ecc147','#a37616'],
 blue:['#b2e2ff','#478fc7','#22547d'],green:['#beedca','#58a97a','#286246'],
 orange:['#ffe2a5','#ed984a','#a95321'],brown:['#eacaa2','#a47657','#623d31'],
 purple:['#e5caff','#a77ce2','#6542a5'],pink:['#ffe4f2','#ea85b8','#aa4b7c'],
 cyan:['#c4fcff','#48c5d8','#1d7993'],lime:['#f2ffc6','#b3e454','#698629']
};
function round(c,x,y,w,h,r){c.beginPath();c.roundRect(x,y,w,h,r)}
function fill(c,x,y,w,h,color,r=0){c.fillStyle=color;if(r){round(c,x,y,w,h,r);c.fill()}else c.fillRect(x,y,w,h)}
function stroke(c,x,y,w,h,color,width=1,r=0){c.strokeStyle=color;c.lineWidth=width;if(r){round(c,x,y,w,h,r);c.stroke()}else c.strokeRect(x,y,w,h)}
function grad(c,x,y,w,h,colors){const g=c.createLinearGradient(x,y,x+w*.22,y+h);colors.forEach(([t,color])=>g.addColorStop(t,color));return g}
function circ(c,x,y,r,fillColor,strokeColor=null,sw=1){c.beginPath();c.arc(x,y,r,0,2*Math.PI);if(fillColor){c.fillStyle=fillColor;c.fill()}if(strokeColor){c.lineWidth=sw;c.strokeStyle=strokeColor;c.stroke()}}
function type(c,text,x,y,size,color=INK,align='center',weight=700){c.save();c.fillStyle=color;c.font=`${weight} ${size}px system-ui, sans-serif`;c.textAlign=align;c.textBaseline='middle';c.fillText(text,x,y);c.restore()}
function screw(c,x,y){circ(c,x,y,2.3,'#3c4847','#9d9c87',.65);c.beginPath();c.strokeStyle='#b9b6a1';c.lineWidth=.7;c.moveTo(x-1,y+1);c.lineTo(x+1,y-1);c.stroke()}
function shell(c,w,h,kind){
 const wood=kind==='mastermind',sea=kind==='battleship';
 const edge=wood?'#9c6749':sea?'#729599':'#708d82';
 const dark=wood?'#311e19':sea?'#13272e':'#172826';
 fill(c,0,0,w,h,'#070c0e');
 fill(c,4,4,w-8,h-8,grad(c,4,4,w-8,h-8,[[0,edge],[.17,dark],[1,'#111c1f']]),11);
 stroke(c,4.5,4.5,w-9,h-9,wood?'#c49c72':sea?'#7baeb0':'#819f8b',1,10);
 fill(c,10,10,w-20,h-20,grad(c,10,10,w-20,h-20,[[0,wood?'#855a43':sea?'#375661':'#304940'],[.5,wood?'#684532':sea?'#264650':'#253f37'],[1,wood?'#4f3327':sea?'#19323e':'#1b3530']]),6);
 stroke(c,11,11,w-22,h-22,'#ffffff24',.8,5);
 for(const [x,y] of [[14,14],[w-14,14],[14,h-14],[w-14,h-14]])screw(c,x,y);
}
function recessed(c,x,y,r,type='wood'){
 const rim=type==='wood'?'#c38e67':type==='sea'?'#78a6ae':'#729889';
 const mid=type==='wood'?'#6c4736':type==='sea'?'#284b59':'#2f5e4a';
 circ(c,x,y+1,r+1.6,'#090d10');
 circ(c,x,y,r+.35,mid,rim,.9);
 const g=c.createRadialGradient(x-r*.3,y-r*.35,.5,x,y+1,r);
 g.addColorStop(0,'#10171b');g.addColorStop(.65,'#202c2e');g.addColorStop(1,type==='wood'?'#3d2e29':'#19323a');
 circ(c,x,y,r-1.5,g);
 circ(c,x-r*.32,y-r*.40,Math.max(.75,r*.15),'#ffffff22');
}
function peg(c,x,y,color,r=10){
 const [hi,mid,lo]=COLORS[color]||COLORS.brown;
 circ(c,x,y+1.4,r+.9,'#070b0da8');
 const g=c.createRadialGradient(x-r*.40,y-r*.48,r*.12,x,y,r);
 g.addColorStop(0,hi);g.addColorStop(.45,mid);g.addColorStop(1,lo);
 circ(c,x,y,r,g,'#07101088',.65);
 circ(c,x-r*.32,y-r*.42,r*.21,'#ffffff70');
}
function choose(c,x,y){stroke(c,x-13,y-13,26,26,'#fff0ac',1.4,4);stroke(c,x-15,y-15,30,30,'#172b2a',.8,5)}
export function drawMasterPhoto(canvas,{settings,secret,history=[],draft=[],selected=0,phase='breaker',pending=null},finish){
 const {slots,maxAttempts}=settings,H=96+maxAttempts*28;
 const c=canvas.getContext('2d',{alpha:false});c.save();
 c.clearRect(0,0,320,H);shell(c,320,H,'mastermind');
 fill(c,22,38,276,H-79,grad(c,22,38,276,H-79,[[0,'#a87453'],[.42,'#956747'],[1,'#775037']]),3);
 stroke(c,22.5,38.5,275,H-80,'#e1ae8059',1,3);
 type(c,'SUPER MASTER MIND',160,25,12,'#f7dfbd');
 type(c,'CODE',124,45,7.8,'#ffdfbc');type(c,'CLUES',257,45,7.8,'#ffdfbc');
 fill(c,220,51,1,H-101,'#3f2920ad');fill(c,222,51,.7,H-101,'#e9c19788');
 for(let i=0;i<maxAttempts;i++){
  const y=masterRowY(i),entry=history[i],active=phase!=='complete'&&i===history.length;
  const vals=entry?.guess??(active?(phase==='set-secret'?secret:pending??draft):null);
  if(i%2===0)fill(c,25,y-13,269,27,'#f9dbb50c',2);
  fill(c,29,y+13,265,1,'#3f2a1e5d');
  if(active){fill(c,37,y-13,178,26,'#f9de9046',3);stroke(c,37,y-13,178,26,'#ffe0a78c',.8,3)}
  type(c,String(i+1).padStart(2,'0'),31,y,7,'#f8dfb3','center',650);
  for(const [j,x] of masterSlotCenters(slots).entries()){
    recessed(c,x,y,10.9,'wood');if(vals?.[j])peg(c,x,y,vals[j],9.5);
    if(active&&selected===j&&phase!=='keeper')choose(c,x,y);
  }
  const clues=masterClueCenters(slots,y);
  for(const [j,p] of clues.entries()){
    recessed(c,p.x,p.y,4.05,'wood');
    if(entry&&j<entry.black+entry.white)peg(c,p.x,p.y,j<entry.black?'black':'white',3.85);
  }
 }
 type(c,'CODE BREAKER · 1972',160,H-20,8,'#d0b195', 'center',600);
 c.restore();finish(canvas,'mastermind');return true;
}
function disk(c,x,y,color){
 const white=color===-1,r=13.6;
 circ(c,x,y+1.3,r+1.0,'#041e17b0');
 const g=c.createRadialGradient(x-5,y-6,1,x,y,r);
 if(white){g.addColorStop(0,'#ffffff');g.addColorStop(.7,'#e9e8dc');g.addColorStop(1,'#b8c1b9')}
 else{g.addColorStop(0,'#647478');g.addColorStop(.52,'#273438');g.addColorStop(1,'#10191e')}
 circ(c,x,y,r,g,white?'#4a5853':'#b2bdac',1);
 circ(c,x-4,y-6,2.2,white?'#ffffffc4':'#c6d6dc70');
}
export function drawOthelloPhoto(canvas,{board,selected,legal=[]},finish){
 const c=canvas.getContext('2d',{alpha:false});c.save();c.clearRect(0,0,320,334);shell(c,320,334,'othello');
 fill(c,18,23,284,285,'#071b1b',2);stroke(c,18,23,284,285,'#adbaa1',1);
 const x0=24,y0=30,cell=34;
 for(let row=0;row<8;row++)for(let col=0;col<8;col++){
  const x=x0+col*cell,y=y0+row*cell;
  fill(c,x,y,cell,cell,(row+col)%2===0?'#357c5e':'#2d7258');
  stroke(c,x+.5,y+.5,cell,cell,'#174c40',.9);
  const i=row*8+col,cx=x+17,cy=y+17;
  if(board?.[i])disk(c,cx,cy,board[i]);
  else if(legal.includes(i)){circ(c,cx,cy,5,'#e6e1b2ad','#fff8d6',.7)}
  if(selected===i&&legal.includes(i)){
    stroke(c,x+2,y+2,cell-4,cell-4,'#fff1ab',2.15,3);
    stroke(c,x+5,y+5,cell-10,cell-10,'#f6ffe085',.65,2);
  }
 }
 type(c,'OTHELLO',160,319,11.6,'#e8e0bc');
 c.restore();finish(canvas,'othello');return true;
}
const PLACE={x:35,y:63,cell:25},TARGET={x:35,y:59,cell:25},OWN={x:60,y:412,cell:20};
function grid(c,g){
 const s=g.cell,size=10*s;
 fill(c,g.x-4,g.y-4,size+8,size+8,'#0c232a',2);
 stroke(c,g.x-4,g.y-4,size+8,size+8,'#79a0a1',1.25,2);
 for(let row=0;row<10;row++)for(let col=0;col<10;col++){
  const x=g.x+col*s,y=g.y+row*s;
  fill(c,x,y,s,s,(row+col)%2===0?'#376b79':'#326473');
  stroke(c,x+.4,y+.4,s-.8,s-.8,'#214e5b',.66);
  circ(c,x+s/2,y+s/2,Math.max(1.25,s*.085),'#133b49b5');
 }
}
function ship(c,g,v,ghost=false){
 if(!v?.cells?.length)return;
 const size=v.cells.length,first=v.cells[0],vertical=size>1&&v.cells[1]-first===10;
 const x=g.x+(first%10)*g.cell,y=g.y+Math.floor(first/10)*g.cell;
 const len=g.cell*size-2.6,beam=g.cell*.72;
 c.save();c.globalAlpha=ghost?.52:1;
 c.translate(x+g.cell/2+(vertical?0:(size-1)*g.cell/2),y+g.cell/2+(vertical?(size-1)*g.cell/2:0));
 if(vertical)c.rotate(Math.PI/2);
 const x0=-len/2,y0=-beam/2;
 fill(c,x0,y0,len,beam,'#0c1f29',beam/2);
 fill(c,x0+1.5,y0+1.3,len-3,beam-2.6,grad(c,x0,y0,len,beam,[[0,'#f2f4e9'],[.44,'#acbdba'],[1,'#647e86']]),beam/2);
 stroke(c,x0+1.5,y0+1.3,len-3,beam-2.6,'#1b3e4d',.95,beam/2);
 fill(c,x0+len*.20,y0+beam*.40,len*.58,beam*.22,'#536e76',beam*.11);
 for(let i=1;i<size;i++)circ(c,x0+(i-.5)*g.cell+1.3,0,Math.min(2.15,g.cell*.105),'#d5e7db','#44616a',.8);
 fill(c,x0+len*.58,y0+beam*.29,Math.max(3,len*.12),beam*.42,'#d8e1d5',2);
 c.restore();
}
function marks(c,g,shots){
 if(!shots)return;
 for(let i=0;i<100;i++){
  const t=shots[i];if(!t)continue;
  const x=g.x+(i%10+.5)*g.cell,y=g.y+(Math.floor(i/10)+.5)*g.cell;
  const r=Math.max(3.2,g.cell*.26);
  if(t===2){
   circ(c,x,y,r+1.1,'#61292c','#ffe0ca',.9);
   circ(c,x,y,r,'#ed7466','#ffbd94',.75);
   c.strokeStyle='#591e25';c.lineWidth=Math.max(.95,g.cell*.070);
   c.beginPath();c.moveTo(x-r*.43,y-r*.43);c.lineTo(x+r*.43,y+r*.43);c.moveTo(x+r*.43,y-r*.43);c.lineTo(x-r*.43,y+r*.43);c.stroke();
  }else{
   circ(c,x,y,r,'#f6f4e8','#839aa0',.8);
   circ(c,x-r*.25,y-r*.27,r*.20,'#ffffff');
  }
 }
}
function drawSunk(c,g,v){
 if(!v?.cells?.length)return;
 const first=v.cells[0],vert=v.cells.length>1&&v.cells[1]-first===10;
 const x=g.x+(first%10)*g.cell,y=g.y+Math.floor(first/10)*g.cell;
 const w=g.cell*(vert?1:v.cells.length),h=g.cell*(vert?v.cells.length:1);
 c.save();stroke(c,x+1.1,y+1.1,w-2.2,h-2.2,'#ffb2a1',1.5,2);
 // Small corners rather than labels over the hit/miss pegs.
 for(const [xx,yy] of [[x+3,y+3],[x+w-3,y+3],[x+3,y+h-3],[x+w-3,y+h-3]])circ(c,xx,yy,1.1,'#ffe8b4');
 c.restore();
}
function paint(c,g,ships,shots,selected,showShips=false,proposal=null,sunk=[]){
 grid(c,g);
 if(showShips)for(const v of ships||[])ship(c,g,v);
 if(proposal?.cells?.length)ship(c,g,{cells:proposal.cells},true);
 marks(c,g,shots);
 for(const vessel of sunk)drawSunk(c,g,vessel);
 if(Number.isInteger(selected)&&selected>=0){
  const x=g.x+(selected%10)*g.cell,y=g.y+Math.floor(selected/10)*g.cell;
  fill(c,x+1,y+1,g.cell-2,g.cell-2,'#ffe4ae32',2);
  stroke(c,x+1.5,y+1.5,g.cell-3,g.cell-3,'#ffe7a5',1.8,2);
 }
}
export function drawBattlePhoto(canvas,{phase,ownShips=[],ownShots=[],targetShots=[],targetShips=[],sunkTargetShips=[],sunkOwnShips=[],revealTargets=false,pendingShot=null,proposal=null},finish){
 const placing=phase==='place',H=placing?368:652;
 const c=canvas.getContext('2d',{alpha:false});c.save();c.clearRect(0,0,320,H);
 shell(c,320,H,'battleship');
 if(placing){
  type(c,'DEPLOY YOUR FLEET',160,30,11.5,'#e6efdb');
  paint(c,PLACE,ownShips,null,null,true,proposal);
  type(c,'SELECT A SHIP · THEN CHOOSE CELLS',160,338,8.1,'#d2e1df');
 }else{
  type(c,'TARGET WATERS',160,29,11.5,'#e6efdb');
  paint(c,TARGET,targetShips,targetShots,pendingShot,revealTargets,null,sunkTargetShips);
  // Minimal hinge — no bright blocks over the grid.
  fill(c,27,348,266,13,'#152a32',4);stroke(c,27,348,266,13,'#74969a',.7,4);
  for(const x of [69,160,251])circ(c,x,354.5,4.2,'#9ab4b1','#193640',.9);
  type(c,'YOUR FLEET',160,390,11.4,'#e6efdb');
  paint(c,OWN,ownShips,ownShots,null,true,null,sunkOwnShips);
  type(c,'HIT · MISS · SINK THE FLEET',160,636,8.3,'#d2e1df');
 }
 c.restore();finish(canvas,'battleship');return true;
}
