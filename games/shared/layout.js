/* Coordinate contracts shared by the high-resolution plates and hit tests.
   Keep every position in logical 320px board coordinates. */
export const masterSlotCenters=slots=>slots===4?[68,106,144,182]:[49,84,119,154,189];
export const masterRowY=row=>58+row*28;
/* Triangular clue constellation: no adjacent socket lips or pegs touch.
   5 slots: three in the upper row, two centered in the gaps below.
   4 slots: a spacious, aligned 2x2 pattern. */
export const masterClueCenters=(slots,rowY)=>{
 const top=slots===4?[247,270]:[237,258,279];
 const bottom=slots===4?[247,270]:[247.5,268.5];
 return [
  ...top.map(x=>({x,y:rowY-7})),
  ...bottom.map(x=>({x,y:rowY+7}))
 ];
};
