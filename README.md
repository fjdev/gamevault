# GAME VAULT · v17 | Sharper gameplay, corrected corridor texture filtering

This release addresses the visual legibility issues identified in v16. Read `VISUAL_CHANGES_V17.md` for the precise technical changes and limitations. Three concept-driven menu still lifes are included, while the dynamic gameplay boards retain the registered v15 assets and 320px logical hit coordinates. The corridor remains animated and uses mipmapping to reduce perspective texture aliasing.

---

# GAME VAULT · v16 | Unified Vault menus, Mastermind palette, persistent end boards

Version 16 extends the original v15 physical board visuals without replacing the approved materials or geometry. It preserves the same save keys and rules.

## Visual system

- Game lobbies, setup screens, dialogs, active games and final screens now use the **same bundled VaultPixel typeface** as the title screen. Decorative serif menu typography and mismatched orange/gold buttons have been removed.
- The game screens now reuse the actual **live corridor renderer** (`games/shared/scene.js` imports `dungeon.js`), with reduced contrast and a dark overlay behind game controls. The same static corridor artwork remains available as a fallback if WebGL is unavailable. The browser's reduced-motion preference is honored.
- Panels are flat near-black with ivory outlines, olive selected states, and compact pixel-text navigation. The physical game photos are retained as the primary artwork in game menus.

## Mastermind colors

Previously there were ten coded colors, but players could select no more than eight. v16 enables **four through twelve colors**: white, red, black, yellow, blue, green, orange, brown, purple, pink, cyan and lime. The last four colors now have independent original 3D peg sprites. Each palette choice also has a visible text label, rather than relying solely on color. The game rules, scoring and peg coordinates are unchanged. The 12-color layout is two rows of six on a mobile screen.

## Final positions stay visible

- **Mastermind:** shows all attempts on the original physical board, plus the revealed secret; no empty active row is highlighted. The board remains visible when the code is cracked or attempts run out.
- **Othello:** shows the full final board and both scores without legal-move highlights.
- **Battleship:** preserves the two naval grids, shot impacts and ship state. The *final* screen reveals all remaining enemy positions; active matches reveal **only ships that are fully sunk**.
- Finished games can be reopened from the lobby using **REVIEW FINAL BOARD** without starting a fresh round.

## Clear Battleship sunk state

Whenever the last segment of a ship is hit, the app displays a large contrasting **SHIP SUNK** notice and the ship's name. Every fully sunk ship is surrounded by a persistent dashed coral-red outline and an X/SUNK stencil on the grid. No unhit enemy ship coordinates are disclosed while the battle is ongoing. Ships sunk by the computer are also tracked on the player's own grid.

## Run and test

Serve the `game-vault/` directory from a static HTTPS site (recommended for PWA installation), or via a local HTTP server such as `python -m http.server 8000` and open the URL. Opening with `file://` will not load ES modules correctly. The updated `sw.js` installs v16 resources in a new offline cache.

`npm test` currently runs **26 passing automated tests**, including final-turn transitions for all three games and logic checks for sunk-only reveal. Visual style snapshots have been inspected in a headless browser using the actual CSS and renderer functions; full local-site navigation was blocked by the testing environment and should be checked on the deployment device.

## Art source

The board plates and chips are original synthetic 3D material renders, not product photos or licensed art extracted from another game. `tools/photo_assets_v15.py` now includes the extra peg colors and remains the regeneration source for the v15-style 3D board assets. The old `ART_PIPELINE_V15.md` and `ART_PIPELINE_V14_HISTORY.md` are retained for reference.

## V18 corridor correction

Removed horizontal crossbars and hanging poles accidentally exposed by periodic arch atlas variants. The repeated arcade is now unobstructed at every station. The perspective-texture mipmapping introduced in v17 remains active to reduce shimmering; these are distinct causes of the reported bands. As with prior revisions, the browser runtime could not be screenshot-verified in the restricted sandbox.
