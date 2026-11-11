# GAME VAULT · VISUAL DESIGN LOCK (v13)

This is the agreed visual target, to prevent unrequested redesigns in later edits.

## Shared art language

The menu establishes the art direction: low-resolution, dark, textural dungeon-crawler atmosphere inspired by 1990s first-person adventure games, rather than clean high-resolution UI. Physical surfaces come first: convincing material, three-dimensional depth, deliberately limited resolution, quantized color and soft grain second. The games' **rules and board coordinates must not change for an art adjustment**.

## Corridor

- Maintain proper camera depth. Never invert surfaces or use a single flat image zoom that looks like sliding wallpaper.
- Arches must be fully visible at normal viewing distance; going close to a doorway may naturally move it outside the frame, but cannot have a hard sprite clipping line.
- Dark sections between lighting stations. Repeating light scheme: left torch, unlit arch, right torch, unlit arch, two torches, unlit arch. Three architectural variants plus irregular bay lengths.
- Dense near-black occlusion beyond approximately 32–36 world units. Never depict twenty lit archways in an infinite tunnel.
- Smooth elapsed-time motion. No snapping integer-frame animation or sudden camera resets.
- Do not change established wordmark, menu layout, fonts or controls merely to edit this effect.

## Boards: chosen PRIMARY direction = faithful vintage physical editions

1. **Battleship — Milton Bradley, circa 1990.** Moulded navy-blue shell, translucent blue-green peg-hole sea grids, grey miniature ships, red and white pegs. Distinct from a fantasy naval board.
2. **Super Master Mind — 1972 era.** Warm brown plastic or wood-look body, rows of pin sockets, glossy colored pegs, smaller black and white clue pegs.
3. **Othello — Pressman, 1990s.** Black plastic case, saturated green playing surface, white/black double-sided discs and recognizable logo.

All render as textured physical game objects, then receive the same low-resolution, color-limited and underexposed photographic treatment. Keep board interaction and coordinate math unchanged.

## NOT implemented as the primary design

An alternative, *not to be blended silently into the vintage boards*, is the medieval/fantasy edition: gems instead of Mastermind pegs, fantasy vessels for Battleship and stone chips on a wooden Othello board. This requires its own art-direction approval.

## Current implementation status

The boards in v13 are procedurally shaded vector/canvas recreations of the physical components. They are **not licensed photographs of collector's sets, nor exact photorealistic 3D scans**. They are visual studies of the intended direction. No original package photographs are included from third-party marketplaces. The corridor preview is a CPU software simulation of the projection, not a captured browser frame. Verify in the target mobile browser before publishing.

## V14 addendum — material-first analog-pixel rendering

Approved visual reference: *No, I’m Not a Human* is an **art-processing direction**, not a request to reproduce its game screens. Render convincing material/volume and lighting first; then sensor resolution, color quantization/dither, shadow falloff and grain. Do not turn the three gameplay boards into hand-placed pixel sprites. Menus use original physical board scenes against the dungeon masonry, while keeping the title corridor and its navigation unchanged. Avoid generic fantasy rune motifs as primary game-hero illustrations.

Technical target in v14: low-resolution at 60% for boards, 4×4 Bayer dither, separate tactile material maps, three physical tabletop lobby images, dark corridor context. This is a materially improved **prototype**: genuine photographic realism still requires original photographs or 3D renders, not another stronger CSS noise filter.

## V16 addendum — typography, modes and end-of-game persistence

All game menus and UI copy must follow the title loop typography (VaultPixel) and its flat dark outlined panels/olive selection styling. The live corridor should stay atmospheric and subordinate to board readability. The original physical game photos remain unchanged. Avoid reintroducing serif fantasy headings or golden gradient panels.

The Mastermind configuration supports 4–12 distinguishable named colors, including the independently rendered purple, pink, cyan and lime pegs. When a game finishes, never replace the physical board with an isolated result card: keep the final board visible and provide replay/menu buttons below it. In Battleship, a sunk enemy ship becomes visually marked only after all cells are hit; the final screen may reveal all ships.
