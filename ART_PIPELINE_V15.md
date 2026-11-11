# V15 · rendered materials, editable sprite plates

- Render resolution: 4× browser board internal resolution.
- Orthographic / top-down camera: exact socket and cell coordinates, no click-map changes.
- Three moulded material families: warm 1970s resin, dark Othello polymer + green textile, midnight-blue naval console + teal peg board.
- Physical props: original 3D source geometry and roughness; manufactured chamfers, visible scratches, molded holes, recessed tracks.
- Moving pieces: transparent renders at the same scale and tungsten/cool-fill lighting as base plates.
- Pipeline: 3D render + separate dynamic plates → composite to original 320px canvas → reduce sensor resolution and color depth → irregular monochrome grain and cinematic falloff.
- Previews: inspect every game in a *playing* state; verify hitmaps unchanged.
- Limit: Rendered still lifes are original synthetic images, not scans or photographs of actual manufactured sets. Future changes to improve realism should be confined to textures/lighting and should keep registered anchor coordinates.
