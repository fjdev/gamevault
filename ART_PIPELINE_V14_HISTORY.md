# Game Vault — asset pipeline required for actual photographic realism

Current v14 boards are stylized Canvas vector/procedural surfaces. Pixel treatment is solved in principle, but **the base geometry and material imagery still need a different production method** to reach a photographic result. Do not attempt to compensate with heavier dithering, sharpening, grain, vignette or a color overlay.

## Desired final look

A believable macro photograph of a manufactured tabletop game, photographed under a small tungsten lamp in a nearly black room. Authentically molded plastic, scratched clearcoat, tiny dust, believable shadow under every peg/disc/ship, reflections and light falloff; THEN low-bit-depth, visible irregular pixels, film noise, restrained warm/cold color separation, crushed blacks. Image-level reference: the photographed/overpainted interiors of *No, I'm Not a Human*. No copying its layouts, art, characters or branding.

## Build each game in separate layers

1. **Mastermind**: one rectified, empty molded board and a set of isolated pegs (all eight colors + black and white clue pins). For 8–12 row settings, use top cap + seamless 28 px row tile + bottom cap, all under one coherent lighting environment. Position each peg on its actual center (`MASTER_X` and `M_ROW_Y`). Ensure lighting direction and contact shadow for every peg.
2. **Othello**: one photographed empty black plastic frame + fully visible green 8×8 game grid; separate front/back disc PNGs at identical scale, photographed under the same light. Grid centers must map exactly to `x=24+34*col+17`, `y=30+34*row+17`, regardless of source-photo perspective.
3. **Battleship**: molded navy ABS console, actual peg-hole grid and empty shell; individual top-view 2–5-cell gray ship sprites, red and ivory peg sprites, plus separate upper/lower game state compositions. Coordinates remain `BATTLE_PLACE`, `BATTLE_TARGET`, `BATTLE_OWN` in `games/shared/boards.js`.

## Image production specs

- Render / photography master resolution: at least 4× internal board dimensions, 16-bit source if practical, all parts in exactly the same camera and light coordinate system.
- Master backgrounds must be pre-rectified top-down without visual perspective warping of the click grid. The lobby artwork can show oblique perspective freely; gameplay board cannot unless the hit map is recalibrated.
- Export background photos and transparent moving-part PNGs. Preserve full-size images for potential desktop high-resolution rendering, but **apply the analog treatment after fully compositing each frame**.
- No random texture on labels or game markings that makes them illegible. Readable hit / selection states must stay above the grain floor.
- Avoid retail box labels, third-party photography and other copyrighted materials unless licensed or independently recreated.

## Acceptance gate

Before calling the look finished, show a full-screen mobile capture of all three actual **play** canvases (not only cover photos), with real pieces in a plausible game state. Visual test: a viewer should initially read it as an imperfect photograph of a manufactured object, then notice the stylized pixelation. A clean vector drawing plus noise fails that test even if the UI looks cohesive.
