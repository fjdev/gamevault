/* Game Vault v15 · independent photographed material atlas.
   Raster photographs are original 3D PBR studio renders. Moving components are
   physically rendered alpha plates, composited BEFORE analog pixel treatment.
   The hit-test coordinate system intentionally remains the original 320px grid. */
const BASE=new URL('../../assets/art/v15/',import.meta.url).href;
const IMAGE_CACHE=new Map();
function photo(name){
  if(typeof Image==='undefined')return null; // test harness/non-browser fallback
  let im=IMAGE_CACHE.get(name);
  if(!im){
    im=new Image();IMAGE_CACHE.set(name,im);
    im.addEventListener('load',()=>{if(typeof window!=='undefined')window.dispatchEvent(new Event('vault-asset-ready'))},{once:true});
    im.src=BASE+name;
  }
  return im.complete&&im.naturalWidth>0?im:null;
}
function image(c,name,x,y,w,h){const im=photo(name);if(!im)return false;c.drawImage(im,x,y,w,h);return true}
function overlay(c,x,y,color='#d7ae64'){
  c.save();c.strokeStyle=color;c.lineWidth=1.6;c.shadowColor=color;c.shadowBlur=3;
  c.beginPath();c.moveTo(x-13,y-13);c.lineTo(x-8,y-13);c.moveTo(x+8,y-13);c.lineTo(x+13,y-13);
  c.moveTo(x-13,y+13);c.lineTo(x-8,y+13);c.moveTo(x+8,y+13);c.lineTo(x+13,y+13);c.stroke();c.restore();
}
const MASTER_X=slots=>slots===4?[68,106,144,182]:[49,84,119,154,189];
const MASTER_Y=n=>58+n*28;
function peg(c,x,y,color,clue=false){const s=clue?11:30;image(c,`peg-${color}.png`,x-s/2,y-s/2,s,s)}
export function drawMasterPhoto(canvas,{settings,secret,history=[],draft=[],selected=0,phase='breaker',pending=null},finish){
  const {slots,maxAttempts}=settings,H=96+maxAttempts*28;
  const bg=photo(`mastermind-${slots}-${maxAttempts}.webp`);if(!bg)return false;
  const c=canvas.getContext('2d',{alpha:false});c.clearRect(0,0,320,H);
  c.imageSmoothingEnabled=true;c.drawImage(bg,0,0,320,H);
  for(let i=0;i<maxAttempts;i++){
    const y=MASTER_Y(i),entry=history[i],active=phase!=='complete'&&i===history.length;
    const values=entry?.guess??(active?(phase==='set-secret'?secret:pending??draft):null);
    if(active){c.fillStyle='#efbd5220';c.fillRect(27,y-13,188,26)}
    for(let j=0;j<slots;j++){
      const x=MASTER_X(slots)[j];if(values?.[j])peg(c,x,y,values[j]);
      if(active&&selected===j&&phase!=='keeper')overlay(c,x,y,'#e9cf8c');
    }
    if(entry)for(let j=0;j<entry.black+entry.white;j++){
      const x=240+(j%3)*16,py=y-5+Math.floor(j/3)*10;
      peg(c,x,py,j<entry.black?'black':'white',true);
    }
  }
  finish(canvas,'mastermind');return true;
}
export function drawOthelloPhoto(canvas,{board,selected,legal=[]},finish){
  const bg=photo('othello-base.webp');if(!bg)return false;
  const c=canvas.getContext('2d',{alpha:false});c.clearRect(0,0,320,334);
  c.imageSmoothingEnabled=true;c.drawImage(bg,0,0,320,334);
  for(let i=0;i<64;i++){
    const row=Math.floor(i/8),col=i%8,x=24+col*34+17,y=30+row*34+17;
    if(board[i])image(c,board[i]===-1?'disc-white.png':'disc-black.png',x-16,y-16,32,32);
    else if(legal.includes(i)){c.beginPath();c.arc(x,y,3,0,Math.PI*2);c.fillStyle='#d5bd8b9a';c.fill()}
  }
  if(selected!==null&&legal.includes(selected)){
    let x=24+(selected%8)*34+17,y=30+Math.floor(selected/8)*34+17;
    overlay(c,x,y,'#ecd8ae');
  }
  finish(canvas,'othello');return true;
}
function ship(c,x,y,size,cell,vertical,ghost=false){
  const im=photo(`ship-${size}.png`);if(!im)return;
  const w=size*cell+6*cell/25,h=26*cell/25;
  c.save();if(ghost)c.globalAlpha=.60;
  if(vertical){c.translate(x+cell/2,y+size*cell/2);c.rotate(Math.PI/2);c.drawImage(im,-w/2,-h/2,w,h)}
  else c.drawImage(im,x-4*cell/25,y+cell/2-h/2,w,h);
  c.restore();
}
function shots(c,grid,state){if(!state)return;for(let i=0;i<100;i++){
  if(!state[i])continue;const x=grid.x+(i%10)*grid.cell+grid.cell/2,y=grid.y+Math.floor(i/10)*grid.cell+grid.cell/2;
  const s=grid.cell*.76;image(c,state[i]===2?'peg-red.png':'peg-white.png',x-s/2,y-s/2,s,s);
}}
function vessels(c,g,ships){for(const sh of ships){if(!sh?.cells?.length)continue;
  const a=sh.cells[0],vertical=sh.cells.length>1&&sh.cells[1]-a===10;
  const x=g.x+(a%10)*g.cell,y=g.y+Math.floor(a/10)*g.cell;
  ship(c,x,y,sh.size,g.cell,vertical,false);
}}
/** Red etched outline and stamp remain for EVERY fully sunk vessel. */
function drawSunk(c,g,ship){
 if(!ship?.cells?.length)return;
 const first=ship.cells[0],vertical=ship.cells.length>1&&ship.cells[1]-first===10;
 const x=g.x+(first%10)*g.cell,y=g.y+Math.floor(first/10)*g.cell;
 const w=(vertical?1:ship.size)*g.cell,h=(vertical?ship.size:1)*g.cell;
 c.save();
 c.shadowColor='#dc271e';c.shadowBlur=3;
 c.strokeStyle='#fa6659';c.lineWidth=2.3;c.setLineDash([5,2]);
 c.strokeRect(x+1.6,y+1.6,w-3.2,h-3.2);
 c.setLineDash([]);
 c.beginPath();c.moveTo(x+3,y+3);c.lineTo(x+w-3,y+h-3);c.moveTo(x+w-3,y+3);c.lineTo(x+3,y+h-3);
 c.strokeStyle='#ff786a';c.lineWidth=1.5;c.stroke();
 const cx=x+w/2,cy=y+h/2;
 c.shadowBlur=0;c.fillStyle='#200609ee';c.fillRect(cx-23,cy-9,46,18);
 c.strokeStyle='#ffa08b';c.lineWidth=.9;c.strokeRect(cx-23,cy-9,46,18);
 c.font='bold 9px monospace';c.textAlign='center';c.textBaseline='middle';c.fillStyle='#ffb4a7';c.fillText('SUNK',cx,cy+.5);
 c.restore();
}
function paintGrid(c,g,ships,marks,selected,showShips=false,proposal=null,sunk=[]){
 if(showShips)vessels(c,g,ships||[]);
 if(proposal?.cells?.length){const a=proposal.cells[0];ship(c,g.x+(a%10)*g.cell,g.y+Math.floor(a/10)*g.cell,proposal.cells.length,g.cell,proposal.vertical,true)}
 shots(c,g,marks);
 // Reveal silhouettes only on the finished board. During play the markers
 // outline fully destroyed ships but cannot leak undamaged enemy positions.
 for(const vessel of sunk)drawSunk(c,g,vessel);
 if(Number.isInteger(selected)&&selected>=0){const col=selected%10,row=Math.floor(selected/10);
    const x=g.x+col*g.cell,y=g.y+row*g.cell,cell=g.cell;
    c.fillStyle='#e5ce8e2b';c.fillRect(x+1,y+1,cell-2,cell-2);
    c.strokeStyle='#f4df9d';c.lineWidth=1.4;c.strokeRect(x+1.5,y+1.5,cell-3,cell-3);
 }
}
const PLACE={x:35,y:63,cell:25},TARGET={x:35,y:59,cell:25},OWN={x:60,y:412,cell:20};
export function drawBattlePhoto(canvas,{phase,ownShips=[],ownShots=[],targetShots=[],targetShips=[],sunkTargetShips=[],sunkOwnShips=[],revealTargets=false,pendingShot=null,proposal=null},finish){
  const placing=phase==='place',H=placing?368:652;
  const bg=photo(placing?'battleship-place.webp':'battleship-play.webp');if(!bg)return false;
  const c=canvas.getContext('2d',{alpha:false});c.clearRect(0,0,320,H);
  c.imageSmoothingEnabled=true;c.drawImage(bg,0,0,320,H);
  if(placing){paintGrid(c,PLACE,ownShips,[],null,true,proposal)}
  else{paintGrid(c,TARGET,targetShips,targetShots,pendingShot,revealTargets,null,sunkTargetShips);paintGrid(c,OWN,ownShips,ownShots,null,true,null,sunkOwnShips)}
  finish(canvas,'battleship');return true;
}
