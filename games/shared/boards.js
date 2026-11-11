import {drawMasterPhoto,drawOthelloPhoto,drawBattlePhoto} from './photo.js';
/* Game Vault — tactile boards. Game rules and the tap-to-cell contract are unchanged.
   Physical materials are painted first; the retro-fantasy palette is a restrained trim. */
export const MASTER_X=slots=>slots===4?[68,106,144,182]:[49,84,119,154,189];
export const M_ROW_Y=n=>58+n*28;
export const OTHELLO_GRID={x:24,y:30,cell:34,n:8};
export const BATTLE_PLACE={x:35,y:63,cell:25,n:10};
export const BATTLE_TARGET={x:35,y:59,cell:25,n:10};
export const BATTLE_OWN={x:60,y:412,cell:20,n:10};
const PIGMENTS={white:['#fff7e7','#d1cab7','#82796e'],red:['#f58b69','#ad342b','#5d1618'],black:['#a3a7ab','#272d32','#080b11'],yellow:['#fff0a0','#d4a63b','#86602c'],blue:['#95c5eb','#3268a1','#173351'],green:['#add4b0','#46876c','#1d4636'],orange:['#ffd2a0','#cb7137','#73351c'],brown:['#d1ae83','#856049','#4a3027'],purple:['#e7c2ff','#9861db','#3d1a6a'],pink:['#ffe5ef','#eb81ab','#94365d'],cyan:['#b9ffff','#20c4d1','#075e6d'],lime:['#f0ff9d','#a1d731','#4d6814']};
const clamp=(n,a=0,b=1)=>Math.max(a,Math.min(b,n));
function path(c,x,y,w,h,r=3){r=Math.max(0,Math.min(r,w/2,h/2));c.beginPath();c.moveTo(x+r,y);c.lineTo(x+w-r,y);c.quadraticCurveTo(x+w,y,x+w,y+r);c.lineTo(x+w,y+h-r);c.quadraticCurveTo(x+w,y+h,x+w-r,y+h);c.lineTo(x+r,y+h);c.quadraticCurveTo(x,y+h,x,y+h-r);c.lineTo(x,y+r);c.quadraticCurveTo(x,y,x+r,y);c.closePath()}
function fill(c,x,y,w,h,color,r=0){path(c,x,y,w,h,r);c.fillStyle=color;c.fill()}
function line(c,x1,y1,x2,y2,color='#777',width=1){c.beginPath();c.moveTo(x1,y1);c.lineTo(x2,y2);c.strokeStyle=color;c.lineWidth=width;c.stroke()}
function gradient(c,x,y,w,h,stops,vertical=true){const g=c.createLinearGradient(x,y,vertical?x:x+w,vertical?y+h:y);stops.forEach(([p,color])=>g.addColorStop(p,color));return g}
function radial(c,x,y,r,stops){const g=c.createRadialGradient(x-r*.3,y-r*.37,0,x,y,r);stops.forEach(([p,col])=>g.addColorStop(p,col));return g}
function hash(a,b,seed=0){let n=Math.imul((a|0)+seed*23,374761393)^Math.imul((b|0)+seed*97,668265263);n=Math.imul(n^(n>>>13),1274126177);return((n^(n>>>16))>>>0)/4294967296}
function lettering(c,text,x,y,size=9,color='#cabd9b',align='left'){c.save();c.font=`${size>=10?'bold ':''}${size}px Georgia, serif`;c.textAlign=align;c.textBaseline='top';c.fillStyle='#0b0c0baa';c.fillText(text,x+.7,y+1);c.fillStyle=color;c.fillText(text,x,y);c.restore()}
function grain(c,x,y,w,h,seed=1,density=70){c.save();path(c,x,y,w,h,2);c.clip();for(let i=0;i<density;i++){const yy=y+hash(i,6,seed)*h,xx=x+hash(i,3,seed)*w;const length=w*(.07+hash(i,12,seed)*.50);line(c,xx,yy,Math.min(x+w,xx+length),yy+(hash(i,19,seed)-.5)*2,hash(i,29,seed)>.5?'#e4b77e17':'#110b071e',.45+hash(i,1,seed)*.55)}c.restore()}
function bolt(c,x,y,r=2.8){c.beginPath();c.arc(x,y,r+1,0,Math.PI*2);c.fillStyle='#100d0b';c.fill();c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fillStyle=radial(c,x,y,r,[ [0,'#e6cb8c'],[.35,'#988464'],[1,'#3a3024'] ]);c.fill();line(c,x-r*.46,y+r*.4,x+r*.5,y-r*.43,'#463d31',.75)}
function table(c,w,h,finish='walnut'){const ocean=finish==='navy',green=finish==='green';const wood=ocean?['#17212a','#293b43','#111923']:green?['#241e17','#594531','#201a14']:['#2b1814','#6d4432','#2b1816'];
 fill(c,0,0,w,h,'#07090a');c.save();c.shadowColor='#000';c.shadowBlur=14;c.shadowOffsetY=4;fill(c,4,4,w-8,h-8,gradient(c,4,4,w-8,h-8,[[0,wood[2]],[.25,wood[1]],[.55,wood[0]],[1,wood[2]]]),7);c.restore();
 grain(c,5,5,w-10,h-10,ocean?25:12,180);
 fill(c,9,9,w-18,h-18,'#171a1b',4);line(c,12,12,w-12,12,'#ad9362',1.15);line(c,12,12,12,h-12,'#705536',1);line(c,13,h-12,w-12,h-12,'#0c0d0d',2);
 for(let a of [[16,16],[w-16,16],[16,h-16],[w-16,h-16]])bolt(c,...a,2.35);
}
function well(c,x,y,w,h,type='wood'){const pale=type==='wood'?'#765c3b':type==='sea'?'#536574':'#78875a';fill(c,x-4,y-4,w+8,h+8,'#060909',3);fill(c,x-2,y-2,w+4,h+4,gradient(c,x-2,y-2,w+4,h+4,[[0,'#0c1011'],[.28,pale],[1,'#1d2528']]),2);fill(c,x,y,w,h,'#181c1b',1);}
function brassRule(c,x1,y1,x2,y2,thick=1){line(c,x1+.5,y1+.5,x2+.5,y2+.5,'#665232',thick+1);line(c,x1,y1,x2,y2,'#d4b979',thick*.62)}
function socket(c,x,y,r=10.5){c.save();c.shadowColor='#040404';c.shadowBlur=2;c.shadowOffsetY=1.3;c.beginPath();c.arc(x,y,r+1.8,0,Math.PI*2);c.fillStyle=gradient(c,x-r,y-r,2*r,2*r,[[0,'#9a784e'],[.42,'#3b3025'],[1,'#b3a078']]);c.fill();c.restore();c.beginPath();c.arc(x,y,r-1,0,Math.PI*2);c.fillStyle=radial(c,x+.8,y+1.4,r,[ [0,'#050709'],[.7,'#101618'],[1,'#353332'] ]);c.fill()}
function peg(c,x,y,r,color){if(!color)return;const [light,mid,dark]=PIGMENTS[color]??PIGMENTS.brown;c.save();c.shadowColor='#0009';c.shadowOffsetY=2;c.shadowBlur=3;c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fillStyle=radial(c,x,y,r,[[0,light],[.38,mid],[.78,mid],[1,dark]]);c.fill();c.restore();c.beginPath();c.ellipse(x-r*.31,y-r*.38,r*.33,r*.23,-.55,0,Math.PI*2);c.fillStyle='#ffffffe0';c.fill();c.beginPath();c.arc(x+r*.35,y+r*.33,r*.12,0,Math.PI*2);c.fillStyle='#110b0c66';c.fill()}
function clue(c,x,y,value){socket(c,x,y,4.2);if(value){const light=value==='black'?'#9ca8ac':'#fff8dc',mid=value==='black'?'#242d33':'#ded6be',dark=value==='black'?'#08090c':'#888071';c.beginPath();c.arc(x,y,3.25,0,Math.PI*2);c.fillStyle=radial(c,x,y,4,[[0,light],[.42,mid],[1,dark]]);c.fill()}}
// All three boards use the same limited-resolution, grainy light treatment as the title loop.
// There are deliberately NO fantasy symbols or medieval ornaments on the original vintage editions.
function weathered(c,x,y,w,h,seed=7,density=1800,strength=1){
 c.save();path(c,x,y,w,h,3);c.clip();
 for(let i=0;i<density;i++){
  const xx=x+hash(i,14,seed)*w,yy=y+hash(i,31,seed)*h;
  const bright=hash(i,18,seed)>.46;
  const radius=.25+hash(i,3,seed)*1.2;
  c.fillStyle=bright?`rgba(255,236,184,${.025*strength})`:`rgba(5,9,9,${.043*strength})`;
  c.fillRect(xx,yy,radius,radius);
 }
 c.restore();
}

/* Material pass. We generate the surface at picture resolution, rather than drawing
   pixel art first: worn injection-moulded resin, varnished mahogany and felt have
   different spatial frequencies and directional response to the same light. */
const materialCache=new Map();
const lrp=(a,b,t)=>a+(b-a)*t;
const smooth=t=>t*t*(3-2*t);
function valueNoise(x,y,scale,seed){
 const ax=Math.floor(x/scale),ay=Math.floor(y/scale),fx=smooth(x/scale-ax),fy=smooth(y/scale-ay);
 return lrp(lrp(hash(ax,ay,seed),hash(ax+1,ay,seed),fx),lrp(hash(ax,ay+1,seed),hash(ax+1,ay+1,seed),fx),fy);
}
const materialBases={
 wood:[113,73,49],brown:[151,100,67],felt:[21,116,91],black:[26,30,31],navy:[28,53,70],sea:[38,124,126]
};
function textureOf(c,kind){
 if(materialCache.has(kind))return materialCache.get(kind);
 const size=192,src=(typeof document!=='undefined'&&document.createElement)?document.createElement('canvas'):new c.canvas.constructor(size,size);
 src.width=src.height=size;
 const t=src.getContext('2d'),im=t.createImageData(size,size),a=im.data;
 const base=materialBases[kind]||materialBases.brown;
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){
  const lo=valueNoise(x,y,51,5),med=valueNoise(x,y,16,9),hi=hash(x,y,13);
  let v=(lo-.5)*20+(med-.5)*13+(hi-.5)*14;
  if(kind==='wood'||kind==='brown'){
   const warp=y+Math.sin(x*.066+med*2.1)*3.1;
   const stripe=Math.sin(warp*.77+lo*7.0),fine=Math.sin(warp*2.6+med*1.8);
   v+=(stripe*6+fine*2.7)+(hash(x,Math.floor(y/2),3)-.5)*7;
  }else if(kind==='felt')v+=(hi-.5)*18+Math.sin(y*.31+x*.28)*1.8;
  else if(kind==='sea')v+=Math.sin(y*.11+lo*9)*6+(hi>.988?21:0);
  else v+=((hi>.986)?14:0)+Math.sin((x+y)*.31)*.9;
  const i=(y*size+x)*4;
  const warm=(kind==='wood'||kind==='brown'),rust=warm?(med-.5)*7:0;
  for(let k=0;k<3;k++)a[i+k]=Math.max(0,Math.min(255,Math.round(base[k]+v*(k===2&&warm?.65:1)+rust*(k===0?1:k===2?-.7:.1))));
  a[i+3]=255;
 }
 t.putImageData(im,0,0);materialCache.set(kind,src);return src;
}
function material(c,x,y,w,h,kind,alpha=.72,r=1){
 const tex=textureOf(c,kind);
 c.save();path(c,x,y,w,h,r);c.clip();c.globalAlpha=alpha;
 const p=c.createPattern(tex,'repeat');
 if(p){c.fillStyle=p;c.fillRect(x,y,w,h)}
 c.restore();
}
function rubbedEdges(c,x,y,w,h,seed=7){
 c.save();path(c,x,y,w,h,4);c.clip();
 for(let i=0;i<75;i++){
  const xx=x+hash(i,17,seed)*w,yy=y+hash(i,18,seed)*h;
  const len=2+hash(i,8,seed)*18;
  line(c,xx,yy,xx+len,yy+(hash(i,11,seed)-.5)*.7,hash(i,4,seed)>.55?'#f6deae1c':'#06080c2c',.45);
 }
 c.restore();
}
function ambientSurface(c,x,y,w,h){
 c.save();c.globalCompositeOperation='multiply';
 const r=c.createRadialGradient(x+w*.23,y+h*.12,4,x+w*.50,y+h*.54,Math.max(w,h)*.86);
 r.addColorStop(0,'rgba(255,255,255,1)');r.addColorStop(.55,'rgba(203,193,177,.94)');r.addColorStop(1,'rgba(77,79,82,.89)');
 c.fillStyle=r;c.fillRect(x,y,w,h);c.restore();
}

function physicalFrame(c,w,h,kind){
 const colors=kind==='mastermind'?['#573523','#b28560','#6b412d','#d4aa78']:
  kind==='othello'?['#060b0d','#303b39','#101719','#72756b']:
  ['#091924','#243d4a','#102735','#6e9ba2'];
 c.save();c.shadowColor='#000';c.shadowBlur=15;c.shadowOffsetY=4;
 fill(c,2,2,w-4,h-4,gradient(c,2,2,w-4,h-4,[[0,colors[3]],[.04,colors[1]],[.25,colors[0]],[.7,colors[2]],[1,'#050b0e']]),9);
 c.restore();
 fill(c,8,8,w-16,h-16,gradient(c,8,8,w-16,h-16,[[0,colors[2]],[.38,colors[1]],[1,colors[0]]]),5);
 line(c,8,8,w-9,8,colors[3],1.5);
 line(c,8,8,8,h-8,colors[3],1.0);
 line(c,w-9,12,w-9,h-9,'#020405aa',2);
 line(c,13,h-9,w-12,h-9,'#020405aa',2);
 material(c,9,9,w-18,h-18,kind==='mastermind'?'brown':kind==='othello'?'black':'navy',.33,5);
 rubbedEdges(c,10,10,w-20,h-20,21);
 line(c,10,14,w-11,14,'#ffe7bf21',1.2);
 weathered(c,7,7,w-14,h-14,31,650,.6);
 for(const [xx,yy] of [[14,14],[w-14,14],[14,h-14],[w-14,h-14]])bolt(c,xx,yy,2.1);
}
function plasticPeg(c,x,y,r,color){
 const [light,mid,dark]=PIGMENTS[color]??PIGMENTS.brown;
 c.save();c.shadowColor='#08030099';c.shadowBlur=3.2;c.shadowOffsetY=3;
 c.beginPath();c.ellipse(x,y+1.4,r*.89,r*.9,0,0,2*Math.PI);c.fillStyle=dark;c.fill();
 c.beginPath();c.arc(x,y-1.15,r*.89,0,2*Math.PI);c.fillStyle=radial(c,x-1,y-1.15,r,[[0,light],[.35,mid],[.72,mid],[1,dark]]);c.fill();
 c.restore();
 c.beginPath();c.ellipse(x-r*.31,y-r*.39,r*.30,r*.13,-.45,0,2*Math.PI);c.fillStyle='#ffffff83';c.fill();
 c.beginPath();c.ellipse(x+r*.23,y+r*.30,r*.25,r*.09,-.45,0,2*Math.PI);c.fillStyle='#00000035';c.fill();
 c.beginPath();c.arc(x,y-1.15,r*.81,0,2*Math.PI);c.strokeStyle='#fdf1d538';c.lineWidth=.7;c.stroke();
}
function vintageHole(c,x,y,r){
 c.save();c.shadowColor='#edb484';c.shadowOffsetY=1;c.shadowBlur=1;
 c.beginPath();c.arc(x,y,r+2.0,0,2*Math.PI);c.fillStyle=radial(c,x,y,r+2,[[0,'#311a14'],[.70,'#4a2d20'],[.83,'#e1a877'],[1,'#75462e']]);c.fill();c.restore();
 c.beginPath();c.arc(x,y,r-1,0,2*Math.PI);c.fillStyle=radial(c,x,y,r-1,[[0,'#1b1210'],[.68,'#342019'],[1,'#5f3b2a']]);c.fill();
}
function studioFinish(canvas,kind){
 // Material-first finish. Do not throw away 40% of the board's pixels and then
 // enlarge with nearest-neighbour: it destroys small clue pegs and shot marks.
 // Filmic falloff is limited to the periphery, away from the playable sockets.
 if(typeof document==='undefined')return;
 const w=canvas.width,h=canvas.height,c=canvas.getContext('2d');
 c.save();c.setTransform(1,0,0,1,0,0);
 const glow=c.createRadialGradient(w*.16,h*.10,0,w*.22,h*.19,Math.max(w,h)*.83);
 glow.addColorStop(0,'rgba(224,152,98,.045)');glow.addColorStop(1,'rgba(224,152,98,0)');
 c.fillStyle=glow;c.fillRect(0,0,w,h);
 const vignette=c.createRadialGradient(w*.49,h*.46,Math.min(w,h)*.45,w*.50,h*.48,Math.max(w,h)*.85);
 vignette.addColorStop(0,'rgba(0,0,0,0)');vignette.addColorStop(.78,'rgba(0,0,0,.015)');vignette.addColorStop(1,'rgba(0,0,0,.13)');
 c.fillStyle=vignette;c.fillRect(0,0,w,h);
 c.restore();
}
export function drawMastermind(canvas,{settings,secret,history=[],draft=[],selected=0,phase='breaker',pending=null}){
 const {slots,maxAttempts}=settings,H=96+maxAttempts*28;cSize(canvas,320,H);
 if(drawMasterPhoto(canvas,{settings,secret,history,draft,selected,phase,pending},studioFinish))return{height:H,grid:{rowY:M_ROW_Y,slotX:MASTER_X(slots),active:history.length}};
 const c=canvas.getContext('2d',{alpha:false});c.imageSmoothingEnabled=true;
 physicalFrame(c,320,H,'mastermind');
 fill(c,17,35,286,H-74,gradient(c,17,35,286,H-74,[[0,'#d6a47c'],[.26,'#a87b57'],[.68,'#926344'],[1,'#69452d']]),5);
 material(c,18,37,284,H-78,'brown',.54,5);
 ambientSurface(c,18,37,284,H-78);
 rubbedEdges(c,19,38,282,H-80,44);
 weathered(c,18,37,284,H-78,73,1600,1.1);
 fill(c,223,44,1,H-98,'#4b2a1d');line(c,225,46,225,H-54,'#deab7d70',.6);
 c.save();c.font='bold 13px Arial, sans-serif';c.textAlign='center';c.fillStyle='#4e3021';c.fillText('SUPER MASTER MIND',160,26);
 c.fillStyle='#f5c39779';c.fillText('SUPER MASTER MIND',159.3,25.3);c.restore();
 lettering(c,'C O D E',126,36,7,'#643d2a','center');lettering(c,'KEY',258,36,7,'#59382a','center');
 for(let i=0;i<maxAttempts;i++){
  const y=M_ROW_Y(i),entry=history[i],active=phase!=='complete'&&i===history.length;
  const values=entry?.guess??(active?(phase==='set-secret'?secret:pending??draft):null);
  fill(c,25,y-12,271,24,gradient(c,25,y-12,271,24,[[0,'#e2b48a33'],[.2,'#00000000'],[1,'#4b2e1e36']]),2);
  line(c,24,y+12,298,y+12,'#4f352b84',1);line(c,24,y+13,298,y+13,'#f1c69a3b',.65);
  if(active){fill(c,29,y-11,189,23,'#ffffb616',2);line(c,30,y-10,216,y-10,'#f6dc9d',1);line(c,30,y+11,216,y+11,'#f6dc9d',1)}
  c.save();c.font='bold 8px Arial, sans-serif';c.textAlign='center';c.fillStyle='#563321';c.fillText(String(i+1),35,y+3);c.restore();
  for(let j=0;j<slots;j++){
   const x=MASTER_X(slots)[j];vintageHole(c,x,y,11.5);if(values?.[j])plasticPeg(c,x,y,9.3,values[j]);
   if(active&&selected===j&&phase!=='keeper'){
    line(c,x-12,y-13,x+12,y-13,'#fff1bf',1.5);line(c,x-12,y+13,x+12,y+13,'#fff1bf',1.5);
   }
  }
  for(let j=0;j<slots;j++){
   const xx=240+(j%3)*16,yy=y-5+Math.floor(j/3)*10;
   vintageHole(c,xx,yy,4.7);
   if(entry&&j<entry.black+entry.white){
    const col=j<entry.black?'black':'white';plasticPeg(c,xx,yy,3.4,col);
   }
  }
 }
 c.save();c.textAlign='center';c.font='bold 9px Arial,sans-serif';c.fillStyle='#e6b080';c.fillText('© 1972   •   CODE BREAKER',160,H-20);c.restore();
 studioFinish(canvas,'mastermind');
 return{height:H,grid:{rowY:M_ROW_Y,slotX:MASTER_X(slots),active:history.length}};
}
export function mastermindHit(x,y,game){const cy=M_ROW_Y(game.history.length);if(Math.abs(y-cy)>15)return null;for(let j=0;j<game.settings.slots;j++)if(Math.abs(x-MASTER_X(game.settings.slots)[j])<16)return j;return null}
// Logical coordinates remain 320px wide across all modes and hit tests.
// In browsers draw at 2x native resolution; server-side test canvases stay 1x.
function cSize(canvas,w,h){
 const scale=typeof HTMLCanvasElement!=='undefined'&&canvas instanceof HTMLCanvasElement?2:1;
 if(canvas.width!==w*scale)canvas.width=w*scale;
 if(canvas.height!==h*scale)canvas.height=h*scale;
 canvas.getContext('2d').setTransform(scale,0,0,scale,0,0);
}
function othelloDisc(c,x,y,color){
 const ivory=color===-1;const light=ivory?'#fffefd':'#a8b7b9',mid=ivory?'#dedcce':'#252a2b',dark=ivory?'#aaa89f':'#06090a';
 c.save();c.shadowColor='#000b';c.shadowOffsetY=2.4;c.shadowBlur=3;
 c.beginPath();c.arc(x,y,13.7,0,Math.PI*2);c.fillStyle=ivory?'#8b9388':'#090c0d';c.fill();
 c.beginPath();c.ellipse(x,y-1.5,12.7,12.0,0,0,Math.PI*2);
 c.fillStyle=radial(c,x,y-1.8,13,[[0,light],[.26,mid],[.77,mid],[1,dark]]);c.fill();c.restore();
 c.beginPath();c.ellipse(x-4.8,y-6.6,4.1,1.9,-.35,0,2*Math.PI);c.fillStyle=ivory?'#ffffffcc':'#e9f6f54a';c.fill();
 c.beginPath();c.arc(x,y-1.8,11.8,0,2*Math.PI);c.strokeStyle=ivory?'#ffffff9c':'#88969770';c.lineWidth=.7;c.stroke();
}
export function drawOthello(canvas,{board,turn,selected,legal=[]}){
 cSize(canvas,320,334);if(drawOthelloPhoto(canvas,{board,selected,legal},studioFinish))return{grid:OTHELLO_GRID};
 const c=canvas.getContext('2d',{alpha:false});c.imageSmoothingEnabled=true;
 physicalFrame(c,320,334,'othello');
 // Pressman's 1990s set: deep black molded casing and saturated green felt board.
 fill(c,16,19,288,288,'#030809',3);
 fill(c,21,25,278,279,gradient(c,21,25,278,279,[[0,'#32695e'],[.12,'#149c71'],[.6,'#118766'],[1,'#0e5b4c']]),1);
 material(c,23,27,274,274,'felt',.57,1);
 ambientSurface(c,23,27,274,274);
 rubbedEdges(c,23,27,274,274,12);
 weathered(c,23,27,274,274,53,1600,.72);
 // Slightly imperfect, recessed black printed grid.
 for(let k=0;k<=8;k++){
  const x=24+k*34,y=30+k*34;
  line(c,x,29,x,303,'#0b2727da',1.5);line(c,x+.9,29,x+.9,303,'#8fbca436',.65);
  line(c,23,y,298,y,'#0a2625e0',1.5);line(c,23,y+.9,298,y+.9,'#c0ceae27',.65);
 }
 for(let i=0;i<64;i++){
  const col=i%8,row=Math.floor(i/8),x=24+col*34+17,y=30+row*34+17;
  if(board[i])othelloDisc(c,x,y,board[i]);
  else if(legal.includes(i)){
   c.beginPath();c.arc(x,y,3.4,0,2*Math.PI);c.fillStyle='#efe0ac6d';c.fill();
  }
 }
 if(selected!==null&&legal.includes(selected)){
  const x=24+selected%8*34,y=30+Math.floor(selected/8)*34;
  for(const [dx,dy] of [[1,1],[33,1],[1,33],[33,33]]){
   c.beginPath();c.arc(x+dx,y+dy,2.4,0,2*Math.PI);c.fillStyle='#f5e8c1';c.fill();
  }
 }
 fill(c,100,307,120,22,gradient(c,100,307,120,22,[[0,'#060c0d'],[.6,'#27302d'],[1,'#06090a']]),3);
 c.save();c.font='bold italic 16px Georgia,serif';c.textAlign='center';c.fillStyle='#bfa568';c.fillText('Othello',160,323);c.restore();
 studioFinish(canvas,'othello');return{grid:OTHELLO_GRID};
}
export function othelloHit(x,y){const g=OTHELLO_GRID,col=Math.floor((x-g.x)/g.cell),row=Math.floor((y-g.y)/g.cell);return col>=0&&col<8&&row>=0&&row<8?row*8+col:null}
function chart(c,g){
 const {x,y,cell}=g,w=cell*10;
 fill(c,x-5,y-5,w+10,w+10,'#071b28',3);
 fill(c,x-2,y-2,w+4,w+4,gradient(c,x-2,y-2,w+4,w+4,[[0,'#1c4b59'],[.3,'#5c8b88'],[1,'#183a4a']]),3);
 // Translucent molded plastic gridded sea, as in Milton Bradley's 1990 edition.
 fill(c,x,y,w,w,gradient(c,x,y,w,w,[[0,'#3c9d9b'],[.24,'#1e838c'],[.65,'#146875'],[1,'#0e404f']]),1);
 material(c,x,y,w,w,'sea',.52,1);
 ambientSurface(c,x,y,w,w);
 rubbedEdges(c,x,y,w,w,31);
 weathered(c,x,y,w,w,91,1200,.8);
 c.save();path(c,x,y,w,w,1);c.clip();
 for(let row=0;row<10;row++)for(let col=0;col<10;col++){
  const xx=x+col*cell,yy=y+row*cell;
  fill(c,xx+.4,yy+.4,cell-.9,cell-.9,gradient(c,xx,yy,cell,cell,[[0,'#b3e4cb12'],[.42,'#438c871c'],[1,'#082e3b33']]),1);
  c.beginPath();c.arc(xx+cell/2,yy+cell/2,cell*.19,0,2*Math.PI);c.fillStyle='#062c37af';c.fill();
  c.beginPath();c.arc(xx+cell/2,yy+cell/2,cell*.12,0,2*Math.PI);c.fillStyle='#3e92948c';c.fill();
  c.beginPath();c.arc(xx+cell/2-cell*.035,yy+cell/2-cell*.06,cell*.055,0,2*Math.PI);c.fillStyle='#c4eae158';c.fill();
 }
 c.restore();
 for(let k=0;k<=10;k++){
  const x1=x+k*cell,y1=y+k*cell;
  line(c,x1,y,x1,y+w,'#a4d9bf6b',1);
  line(c,x,y1,x+w,y1,'#aad0b66b',1);
 }
 c.save();c.font='bold 8px Arial, sans-serif';c.textAlign='center';c.fillStyle='#d5e4d3';
 for(let k=0;k<10;k++){
  c.fillText(String.fromCharCode(65+k),x+k*cell+cell/2,y-5.5);
  c.fillText(String(k+1),x-11,y+k*cell+cell/2+2.5);
 }
 c.restore();
}
function vessel(c,x,y,shipSize,cell,vertical,name='Carrier',ghost=false){const len=cell*shipSize,beam=Math.min(cell-4,cell*.77);c.save();if(vertical){c.translate(x+cell/2+beam/2,y);c.rotate(Math.PI/2)}else c.translate(x,y+cell/2-beam/2);c.globalAlpha=ghost?.63:1;
 // A single continuous top-down hull with beveled steel, pointed bow and stern shadow.
 c.save();c.shadowColor='#000c';c.shadowBlur=3;c.shadowOffsetY=2;const hull=()=>{c.beginPath();c.moveTo(2,beam/2);c.quadraticCurveTo(5,1,13,.7);c.lineTo(len-cell*.38,.7);c.lineTo(len-2,beam*.43);c.lineTo(len-2,beam*.56);c.lineTo(len-cell*.38,beam-1);c.lineTo(13,beam-1);c.quadraticCurveTo(5,beam-1,2,beam/2);c.closePath()};hull();c.fillStyle='#040d15';c.fill();c.restore();hull();c.fillStyle=gradient(c,0,0,0,beam,[[0,'#aab3ae'],[.22,'#74878c'],[.53,'#465861'],[.8,'#283d47'],[1,'#0b1b23']]);c.fill();c.strokeStyle='#c6cfbc9c';c.lineWidth=.75;c.stroke();
 fill(c,cell*.35,beam*.27,Math.max(6,len-cell*.95),beam*.46,gradient(c,0,beam*.2,0,beam*.5,[[0,'#9ca3a1'],[.5,'#576770'],[1,'#293c48']]),2);
 for(let i=1;i<shipSize;i++){const cx=i*cell+.5;line(c,cx,beam*.25,cx,beam*.75,'#1d3036a4',.7);if(name==='Carrier'&&i<shipSize-1)fill(c,cx-3,beam*.38,6,beam*.24,'#bac0b4',1);else if(i<shipSize-1)fill(c,cx-2,beam*.38,4,beam*.24,'#aab1b1',1)}
 const center=len*.46;fill(c,center-5,beam*.32,10,beam*.38,'#c0bba9',2);fill(c,center-2.5,beam*.37,5,beam*.28,'#354852',1);
 if(name==='Carrier'){line(c,cell*.35,beam*.2,len-cell*.5,beam*.2,'#ebe1bd',.65);for(let q=1;q<shipSize-1;q++)line(c,cell*q,beam*.55,cell*q+7,beam*.55,'#d4c3a5',.6)}
 c.restore()}
function shotMark(c,x,y,cell,state){
 const cx=x+cell/2,cy=y+cell/2,r=cell*.235;
 if(state!==1&&state!==2)return;
 const red=state===2;
 c.save();c.shadowColor='#071217bd';c.shadowBlur=3;c.shadowOffsetY=2;
 c.beginPath();c.arc(cx,cy,r+1,0,2*Math.PI);c.fillStyle=red?'#4b1718':'#999e98';c.fill();
 c.beginPath();c.arc(cx,cy-1,r,0,2*Math.PI);
 c.fillStyle=radial(c,cx,cy-1,r,red?[[0,'#ffac83'],[.33,'#d43d35'],[1,'#671816']]:[[0,'#fffdfa'],[.55,'#e7eee7'],[1,'#8bada5']]);c.fill();c.restore();
 c.beginPath();c.ellipse(cx-r*.27,cy-r*.40,r*.30,r*.15,-.3,0,2*Math.PI);c.fillStyle='#ffffff9b';c.fill();
}
function wreckStamp(c,g,ship){
 if(!ship?.cells?.length)return;
 const first=ship.cells[0],vertical=ship.cells.length>1&&ship.cells[1]-first===10;
 const x=g.x+(first%10)*g.cell,y=g.y+Math.floor(first/10)*g.cell;
 const w=(vertical?1:ship.size)*g.cell,h=(vertical?ship.size:1)*g.cell;
 c.save();c.strokeStyle='#f97564';c.lineWidth=2;c.setLineDash([4,2]);c.strokeRect(x+1.5,y+1.5,w-3,h-3);c.setLineDash([]);
 c.beginPath();c.moveTo(x+3,y+3);c.lineTo(x+w-3,y+h-3);c.moveTo(x+w-3,y+3);c.lineTo(x+3,y+h-3);c.stroke();
 const cx=x+w/2,cy=y+h/2;c.fillStyle='#240b0bef';c.fillRect(cx-22,cy-9,44,18);
 c.fillStyle='#ffb8a8';c.font='bold 9px monospace';c.textAlign='center';c.textBaseline='middle';c.fillText('SUNK',cx,cy);c.restore();
}
function waters(c,g,ships=[],shots=[],selected=null,showShips=false,proposal=null,sunk=[]){
 chart(c,g);
 if(showShips){for(const ship of ships){if(!ship?.cells?.length)continue;const n=ship.cells[0],vertical=ship.cells.length>1&&ship.cells[1]-n===10;vessel(c,g.x+n%10*g.cell,g.y+Math.floor(n/10)*g.cell,ship.size,g.cell,vertical,ship.name)}}
 if(proposal?.cells){const n=proposal.cells[0];vessel(c,g.x+n%10*g.cell,g.y+Math.floor(n/10)*g.cell,proposal.cells.length,g.cell,proposal.vertical,proposal.name,true)}
 for(let i=0;i<100;i++)if(shots?.[i])shotMark(c,g.x+i%10*g.cell,g.y+Math.floor(i/10)*g.cell,g.cell,shots[i]);
 for(const ship of sunk)wreckStamp(c,g,ship);
 if(selected!==null&&selected!==undefined){const x=g.x+selected%10*g.cell,y=g.y+Math.floor(selected/10)*g.cell;fill(c,x+1,y+1,g.cell-2,g.cell-2,'#eacc8e38',1);line(c,x+1,y+1,x+g.cell-1,y+1,'#fce6ad',1.2)}
}
export function drawBattleship(canvas,{phase,ownShips=[],ownSea=[],ownShots=[],targetShots=[],targetShips=[],sunkTargetShips=[],sunkOwnShips=[],revealTargets=false,pendingShot=null,proposal=null}){
 const placing=phase==='place';cSize(canvas,320,placing?368:652);if(drawBattlePhoto(canvas,{phase,ownShips,ownShots,targetShots,targetShips,sunkTargetShips,sunkOwnShips,revealTargets,pendingShot,proposal},studioFinish))return{grid:placing?BATTLE_PLACE:BATTLE_TARGET};
 const c=canvas.getContext('2d',{alpha:false});c.imageSmoothingEnabled=true;
 if(placing){
  physicalFrame(c,320,368,'battleship');
  c.save();c.font='bold 13px Arial,sans-serif';c.textAlign='center';c.fillStyle='#c9e0df';c.fillText('BATTLESHIP  ·  DEPLOY FLEET',160,28);c.restore();
  waters(c,BATTLE_PLACE,ownShips,[],null,true,proposal);
  fill(c,25,328,270,21,gradient(c,25,328,270,21,[[0,'#35525e'],[.5,'#1b323d'],[1,'#0f202c']]),3);
  c.save();c.font='bold 9px Arial,sans-serif';c.textAlign='center';c.fillStyle='#a4bdb5';c.fillText('NAVAL COMBAT  •  MILTON BRADLEY 1990',160,342);c.restore();
 }else{
  physicalFrame(c,320,652,'battleship');
  c.save();c.font='bold 11px Arial,sans-serif';c.textAlign='center';c.fillStyle='#a9d2ce';c.fillText('TARGET GRID',160,30);c.restore();
  waters(c,BATTLE_TARGET,targetShips,targetShots,pendingShot,revealTargets,null,sunkTargetShips);
  // Injection-molded black hinge and piano-metal pivot bosses.
  fill(c,13,346,294,19,gradient(c,13,346,294,19,[[0,'#101a1f'],[.22,'#47626b'],[.5,'#162832'],[.8,'#435a64'],[1,'#10181e']]),3);
  for(const x of [53,160,267]){
   fill(c,x-12,348,24,14,'#283d46',3);line(c,x-11,352,x+11,352,'#89a3a189',1);bolt(c,x,355,2.2);
  }
  c.save();c.font='bold 11px Arial,sans-serif';c.textAlign='center';c.fillStyle='#a9d2ce';c.fillText('YOUR FLEET',160,391);c.restore();
  waters(c,BATTLE_OWN,ownShips,ownShots,null,true,null,sunkOwnShips);
  fill(c,22,622,276,18,'#05111b',3);
  c.save();c.font='bold 9px Arial,sans-serif';c.textAlign='center';c.fillStyle='#8fbcb6';c.fillText('HIT  •  MISS  •  SINK THE FLEET',160,635);c.restore();
 }
 studioFinish(canvas,'battleship');return{grid:placing?BATTLE_PLACE:BATTLE_TARGET};
}
export function battleHit(x,y,g){const col=Math.floor((x-g.x)/g.cell),row=Math.floor((y-g.y)/g.cell);return col>=0&&col<10&&row>=0&&row<10?row*10+col:null}
export function pointerPos(event,canvas){
 const box=canvas.getBoundingClientRect();
 // Translate DOM CSS pixels back to the stable, logical 320px play surface.
 // Never derive click regions from the high-density backing-store size.
 return{x:(event.clientX-box.left)*320/box.width,
         y:(event.clientY-box.top)*(canvas.height*320/canvas.width)/box.height};
}
