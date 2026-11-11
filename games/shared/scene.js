/* The game menus use the exact same live corridor projection as Vault. */
import {startDungeon} from '../../dungeon.js';
const canvas=document.getElementById('vault-corridor');
if(canvas){
 const motion=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches??false;
 const stop=startDungeon(canvas,{initialTime:3.7,reducedMotion:motion});
 window.addEventListener('pagehide',stop,{once:true});
}
