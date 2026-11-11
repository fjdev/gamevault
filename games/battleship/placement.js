// Geometric placement contract shared by UI and regression tests.
import {FLEET,emptySea,cellsFor,place} from './engine.js';
export function placementsFromShips(ships=[]){return FLEET.map(f=>{const s=ships.find(x=>x.name===f.name);return s?{start:s.cells[0],vertical:s.cells.length>1&&s.cells[1]-s.cells[0]===10}:null})}
export function reconstruct(placements){let sea=emptySea(),ships=[];for(let k=0;k<FLEET.length;k++){
 const p=placements?.[k];if(!p)continue;
 const next=place(sea,ships,p.start,FLEET[k].size,!!p.vertical,FLEET[k].name);
 if(!next)return null;sea=next.sea;ships=next.ships;
 }return{sea,ships}
}
export function validProposal(placements,index,start,vertical){if(index<0||index>=FLEET.length||!Number.isInteger(start))return false;const next=placements.slice();next[index]={start,vertical};return !!reconstruct(next)}
export function proposalCells(index,start,vertical){return FLEET[index]?cellsFor(start,FLEET[index].size,vertical):null}
export function nextUnplaced(placements){return placements.findIndex(x=>x===null||x===undefined)}
