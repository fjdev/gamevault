# GAME VAULT · V17 — legibility-first visual revision

## Goal
Fix excessive chunky rendering and maintain a coherent retro atmosphere without sacrificing puzzle readability. The additional reference ZIP is treated as an **art direction**, not as pre-aligned gameplay boards.

## What changed

- No more mandatory 60% downsampling + low-bit Bayer posterization + nearest-neighbor enlargement of the play surface. High-density browser canvas backing store now draws at 2x, retaining the source photo plates and the 3D sprites. A faint warm edge falloff remains.
- Shared pointer mapping explicitly converts CSS pointer locations into the original **320px logical** playfield, regardless of backing-store density. Mastermind/ Othello/ Battleship grid coordinates and all rules remain unchanged.
- Smaller physical pieces are sized to fit their hit areas: 32px Othello discs within 34px squares; miniature clue pegs on the Mastermind key board; naval hulls closer to one cell tall.
- Clearer palette names, hints and play caption; interface headings and navigation remain VaultPixel, with legible small system-sans color labels.
- WebGL corridor now mipmaps the three repeating 256x256 wall/floor/ceiling textures to suppress perspective aliasing that could cause apparently random scrolling bars. Improved 360x600 sampling and filtered display; alpha-atlas clamping protects portal borders. Architectural spacing, movement curve, torch pattern and darkness are unchanged.
- The three per-game **menus** now display original-composite concept-direction still lifes made from the provided `*-partida.png` reference images. Their physical-board feel is preserved; no static pre-filled board image is used for an interactive state.
- Service worker cache revised so installed PWA clients get the updated resources.

## Scope / non-goals

- This is **not a full photorealistic rebuild** or a replacement of the source v15 gameplay plates; the conceptual images have a different framing and are not 1:1 registered to the multiple Mastermind formats and Battleship's two grids. Directly using them as a playable overlay would create incorrect selectable coordinates.
- Visual appearance should be checked on a real phone/desktop browser after deployment. The sandbox browser blocks local page navigation, so this release is validated by asset/logic tests and static image inspection rather than live end-to-end screenshots.

## Run

Serve this directory on HTTPS or with `python -m http.server 8000`, not with file://. Run `npm test` to execute the 29 tests, including density-independent pointer positions. Refresh a previously installed PWA after upgrading.
