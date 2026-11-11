/* Game Vault — deliberate 1990s first-person dungeon corridor.
   World-space projection, alternating torch stations, three arch types, and
   a real distance blackout. Smooth camera movement; no looping video seam. */
export const LOOP_SECONDS=35.8, SPEED=1.37, FPS=60, FRAMES=0;
export const mod=(n,p)=>((n%p)+p)%p;
export const cameraDistance=seconds=>Math.max(0,seconds)*SPEED;
export const corridorPoint=(x,y,width,height,seconds)=>({frame:cameraDistance(seconds),x,y,width,height});
const W=360,H=600,EYE=1.72,WALL=2.28,ROOF=5.25,HALF_FOV=.77;
const SPACING=[11.4,13.6,10.8,14.2,12.3,9.9,13.1,11.7];
const LIGHT=[1,0,2,0,3,0,1,0]; // LEFT - darkness - RIGHT - darkness - BOTH - darkness
const ARCH=[0,1,2,0,2,1,1,2];
const CYCLE=SPACING.reduce((a,b)=>a+b,0);
export function stationAt(index){
 const cycle=Math.floor(index/SPACING.length),within=mod(index,SPACING.length);
 let z=13.4+cycle*CYCLE;
 for(let i=0;i<within;i++)z+=SPACING[i];
 return{z,kind:ARCH[within],torch:LIGHT[within],index};
}
export function corridorGeometry(seconds,w=W,h=H){
 const camera=cameraDistance(seconds),stations=[];
 const i0=Math.max(0,Math.floor(Math.max(0,camera-13.4)/CYCLE)*SPACING.length-1);
 for(let i=i0;i<i0+20;i++){
  const s=stationAt(i);if(s.z>camera+36)break;
  if(s.z>=camera-4.5)stations.push({...s,distance:s.z-camera});
 }
 return{camera,horizon:h*.5,stations,bays:stations,visibility:36};
}
const VERT=`attribute vec2 aPosition;void main(){gl_Position=vec4(aPosition,0.,1.);}`;
const FRAG=`precision highp float;
uniform vec2 uResolution;
uniform float uCamera,uTime;
uniform float uStations[12],uKinds[12],uLights[12];
uniform sampler2D uArches,uWall,uFloor,uRoof;
void main(){
 vec2 screen=(gl_FragCoord.xy-uResolution*vec2(.5,.515))/(uResolution.y*.5);
 vec3 ray=vec3(screen.x*${HALF_FOV.toFixed(3)},screen.y*${HALF_FOV.toFixed(3)},1.);
 float depth=10000.,kind=-1.;
 if(abs(ray.x)>.00001){float t=${WALL.toFixed(2)}/abs(ray.x);if(t>0.&&t<depth){depth=t;kind=0.;}}
 if(ray.y<-.00001){float t=-${EYE.toFixed(2)}/ray.y;if(t>0.&&t<depth){depth=t;kind=1.;}}
 if(ray.y>.00001){float t=(${ROOF.toFixed(2)}-${EYE.toFixed(2)})/ray.y;if(t>0.&&t<depth){depth=t;kind=2.;}}
 float worldZ=uCamera+depth,worldX=ray.x*depth,worldY=${EYE.toFixed(2)}+ray.y*depth;
 vec3 stone=vec3(.006,.008,.010);
 if(depth<38.){
  if(kind<.5)stone=texture2D(uWall,vec2(worldZ/4.05,worldY/4.1)).rgb;
  else if(kind<1.5)stone=texture2D(uFloor,vec2(worldX/3.15,worldZ/3.15)).rgb;
  else stone=texture2D(uRoof,vec2(worldX/3.1,worldZ/3.1)).rgb;
 }
 float flame=0.;
 for(int i=0;i<12;i++){
  float dz=abs(worldZ-uStations[i]);
  float side=(worldX<-.3?1.:(worldX>.3?2.:3.));
  float isLeft=mod(uLights[i],2.);
  float isRight=step(1.5,uLights[i]);
  float pool=(side<1.5?isLeft:(side<2.5?isRight:(isLeft+isRight)*.42));
  float travel=1./(1.+dz*dz*.40);
  float flicker=.98+.025*sin(uTime*1.31+float(i)*2.63);
  flame=max(flame,pool*travel*flicker);
 }
 float ambient=kind<.5?.135:(kind<1.5?.195:.105);
 float lit=(ambient+flame*(kind<.5?1.05:(kind<1.5?.74:.36)))/(1.+depth*.019);
 stone*=clamp(lit,.008,1.10);
 stone*=vec3(1.+flame*.18,1.+flame*.035,1.-flame*.15);
 // Arches stand in physical planes, in front of the distance-tested corridor.
 for(int i=11;i>=0;i--){
  float distance=uStations[i]-uCamera;
  if(distance>3.9 && distance<depth && distance<38.){
   vec2 projected=vec2(ray.x*distance,${EYE.toFixed(2)}+ray.y*distance);
   vec2 uv=vec2(projected.x/4.72+.5,.183+projected.y*.128);
   if(uv.x>=0.&&uv.x<=1.&&uv.y>=0.&&uv.y<=1.){
    // Atlas: four lighting variations across; all portal variants are unobstructed stone arches.
    float atlasColumn=uLights[i]<.5?1.:(uLights[i]<1.5?0.:uLights[i]);
    float atlasRow=uKinds[i];
    vec2 safeUV=clamp(uv,vec2(.003),vec2(.997));
    vec2 atlasUV=vec2((atlasColumn+safeUV.x)/4.,(2.-atlasRow+safeUV.y)/3.);
    vec4 arch=texture2D(uArches,atlasUV);
    float arrive=smoothstep(4.1,7.0,distance);
    float shade=.85/(1.+max(0.,distance-9.)*.027);
    vec3 painted=arch.rgb*shade;
    // No transom rails or hanging posts: all portal clearances stay open.
   // Near the portal is uncut; it gradually disappears as the camera crosses.
    stone=mix(stone,painted,arch.a*arrive);
   }
  }
 }
 // The lightless curtain is deliberately closer than the geometric horizon.
 // Only the next one or two structures remain legible; there is no endless tunnel.
 float fog=smoothstep(15.,32.,depth);
 stone=mix(stone,vec3(.004,.006,.007),fog);
 if(depth>=36.)stone=vec3(.004,.006,.007);
 // No procedural film grain: it obscures stone detail and causes shimmer.
 gl_FragColor=vec4(stone,1.);
}`;
function imageAt(url){return new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=()=>reject(new Error(`Art failed: ${url}`));img.src=url;});}
const artPath=name=>new URL('./assets/art/'+name,import.meta.url).href;
let loaded=null;
function assets(){if(!loaded)loaded=Promise.all([
 imageAt(artPath('wall-masonry-clean.png')),
 imageAt(artPath('floor-flagstone.png')),
 imageAt(artPath('ceiling-flagstone.png')),
 imageAt(artPath('corridor-arches-atlas.png')),
 imageAt(artPath('corridor-fallback-v13.png'))
]);return loaded;}
function shader(gl,type,source){const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s;}
function webGL(canvas,images){
 const gl=canvas.getContext('webgl',{alpha:false,antialias:true,depth:false,preserveDrawingBuffer:false,powerPreference:'default'});
 if(!gl)return null;
 const p=gl.createProgram();gl.attachShader(p,shader(gl,gl.VERTEX_SHADER,VERT));gl.attachShader(p,shader(gl,gl.FRAGMENT_SHADER,FRAG));gl.linkProgram(p);
 if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(p));gl.useProgram(p);
 const textures=[],vertices=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,vertices);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);
 const pos=gl.getAttribLocation(p,'aPosition');gl.enableVertexAttribArray(pos);gl.vertexAttribPointer(pos,2,gl.FLOAT,false,0,0);
 gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);
 function tex(img,unit,name,repeat=true){
  const t=gl.createTexture();textures.push(t);gl.activeTexture(gl.TEXTURE0+unit);gl.bindTexture(gl.TEXTURE_2D,t);
  gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,img);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,repeat?gl.REPEAT:gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,repeat?gl.REPEAT:gl.CLAMP_TO_EDGE);
  // Minified flagstones without mipmaps form false horizontal/vertical bands
  // during forward camera motion (texture aliasing / moiré).
  const pot=n=>(n&(n-1))===0;
  const mip=pot(img.naturalWidth||img.width)&&pot(img.naturalHeight||img.height);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,mip?gl.LINEAR_MIPMAP_LINEAR:gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
  if(mip)gl.generateMipmap(gl.TEXTURE_2D);
  gl.uniform1i(gl.getUniformLocation(p,name),unit);
 }
 tex(images[0],0,'uWall');tex(images[1],1,'uFloor');tex(images[2],2,'uRoof');tex(images[3],3,'uArches',false);
 const uc=gl.getUniformLocation(p,'uCamera'),ut=gl.getUniformLocation(p,'uTime'),us=gl.getUniformLocation(p,'uStations[0]'),uk=gl.getUniformLocation(p,'uKinds[0]'),ul=gl.getUniformLocation(p,'uLights[0]');
 const res=gl.getUniformLocation(p,'uResolution');
 const resize=()=>{gl.viewport(0,0,canvas.width,canvas.height);gl.uniform2f(res,canvas.width,canvas.height)};
 resize();
 const paint=(camera,elapsed)=>{
  const z=new Float32Array(12),types=new Float32Array(12),lighting=new Float32Array(12);z.fill(1e5);
  const start=Math.max(0,Math.floor(Math.max(0,camera-13.4)/CYCLE)*SPACING.length-1);let j=0;
  for(let i=start;i<start+17&&j<12;i++){
   const station=stationAt(i);if(station.z>=camera-5&&station.z<=camera+40){z[j]=station.z;types[j]=station.kind;lighting[j]=station.torch;j++}
  }
  gl.uniform1f(uc,camera);gl.uniform1f(ut,elapsed);gl.uniform1fv(us,z);gl.uniform1fv(uk,types);gl.uniform1fv(ul,lighting);
  gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
 };
 paint.resize=resize;
 paint.dispose=()=>{textures.forEach(t=>gl.deleteTexture(t));gl.deleteBuffer(vertices);gl.deleteProgram(p)};
 return paint;
}
function makeLayer(canvas,cls){const layer=document.createElement('canvas');layer.width=W;layer.height=H;layer.className=cls;layer.setAttribute('aria-hidden','true');canvas.after(layer);return layer;}
export function renderDungeon(context,seconds=0){
 context.fillStyle='#090b0c';context.fillRect(0,0,W,H);
 if(loaded)loaded.then(images=>context.drawImage(images[4],0,0,W,H)).catch(()=>{});
 return corridorGeometry(seconds);
}
export function startDungeon(canvas,{reducedMotion=false,initialTime=0}={}){
 canvas.width=W;canvas.height=H;
 const base=canvas.getContext('2d',{alpha:false});const surface=makeLayer(canvas,'dungeon-surface');
 let elapsed=initialTime,previous=null,raf=0,stopped=false,ready=false,render=null,fallback=null;
 const updateResolution=()=>{
  // Match real display pixels instead of stretching a 360 × 600 image to 600px.
  // A bounded device scale preserves frame rate in long corridors on phones.
  const box=surface.getBoundingClientRect();
  const scale=Math.min(2,Math.max(1,window.devicePixelRatio||1));
  const w=Math.min(1200,Math.max(W,Math.round(box.width*scale)));
  const h=Math.min(1800,Math.max(H,Math.round(box.height*scale)));
  if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h}
  if(surface.width!==w||surface.height!==h){surface.width=w;surface.height=h;render?.resize?.()}
 };
 updateResolution();
 const paint=()=>{
  if(stopped||!ready)return;
  if(render)render(cameraDistance(elapsed),elapsed);
  else if(fallback&&base)base.drawImage(fallback,0,0,canvas.width,canvas.height);
 };
 surface.addEventListener('webglcontextlost',event=>{event.preventDefault();render=null;surface.style.display='none';if(ready)paint()});
 assets().then(data=>{
  if(stopped)return;fallback=data[4];
  try{updateResolution();render=webGL(surface,data)}catch(error){console.warn('WebGL corridor unavailable; using illustration.',error);render=null}
  surface.style.display=render?'block':'none';ready=true;paint();
 }).catch(error=>console.error('Dungeon assets failed:',error));
 const tick=now=>{
  if(stopped)return;if(previous!==null&&!document.hidden&&!reducedMotion)elapsed+=Math.min(90,Math.max(0,now-previous))/1000;
  previous=now;if(ready&&!document.hidden)paint();if(!reducedMotion)raf=requestAnimationFrame(tick);
 };
 raf=requestAnimationFrame(tick);
 const onResize=()=>{if(!stopped){updateResolution();paint()}};
 window.addEventListener('resize',onResize,{passive:true});
 const stop=()=>{stopped=true;window.removeEventListener('resize',onResize);cancelAnimationFrame(raf);render?.dispose?.();surface.remove()};
 Object.defineProperty(stop,'time',{get:()=>elapsed});return stop;
}
