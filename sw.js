// Game Vault v16: PBR-raster material plates, detachable 3D pieces and analog output.
const CACHE='game-vault-v16-unified-menus-final-boards-1';
const FILES=[
 './','./index.html','./vault.js','./vault.css','./dungeon.js','./manifest.webmanifest','./sw.js',
 './assets/icon-192.png','./assets/icon-512.png','./assets/fonts/vault-pixel.ttf',
 './assets/art/game-vault-logo-pixel.png','./assets/art/corridor-fallback-v13.png','./assets/art/corridor-arches-atlas.png','./assets/art/corridor-plate.png',
 './assets/art/corridor-arch-v7.png','./assets/art/corridor-arch-b.png','./assets/art/corridor-arch-c.png',
 './assets/art/wall-masonry-clean.png','./assets/art/floor-flagstone.png','./assets/art/ceiling-flagstone.png',
 './assets/art/masonry-original.png','./assets/art/paving-original.png',
 './assets/art/mastermind-sigil.png','./assets/art/othello-sigil.png','./assets/art/battleship-sigil.png',
 './assets/art/mastermind-tabletop-v15.webp','./assets/art/othello-tabletop-v15.webp','./assets/art/battleship-tabletop-v15.webp',
 './games/shared/ui.css','./games/shared/ui.js','./games/shared/scene.js','./games/shared/boards.js','./games/shared/photo.js',
 './games/mastermind/','./games/mastermind/index.html','./games/mastermind/app.js','./games/mastermind/engine.js',
 './games/othello/','./games/othello/index.html','./games/othello/app.js','./games/othello/engine.js',
 './games/battleship/','./games/battleship/index.html','./games/battleship/app.js','./games/battleship/engine.js','./games/battleship/placement.js'
 ,
 './assets/art/v15/battleship-place.webp','./assets/art/v15/battleship-play.webp','./assets/art/v15/disc-black.png','./assets/art/v15/disc-white.png','./assets/art/v15/mastermind-4-10.webp','./assets/art/v15/mastermind-4-11.webp','./assets/art/v15/mastermind-4-12.webp','./assets/art/v15/mastermind-4-8.webp','./assets/art/v15/mastermind-4-9.webp','./assets/art/v15/mastermind-5-10.webp','./assets/art/v15/mastermind-5-11.webp','./assets/art/v15/mastermind-5-12.webp','./assets/art/v15/mastermind-5-8.webp','./assets/art/v15/mastermind-5-9.webp','./assets/art/v15/othello-base.webp','./assets/art/v15/peg-black.png','./assets/art/v15/peg-blue.png','./assets/art/v15/peg-brown.png','./assets/art/v15/peg-green.png','./assets/art/v15/peg-cyan.png','./assets/art/v15/peg-lime.png','./assets/art/v15/peg-pink.png','./assets/art/v15/peg-purple.png','./assets/art/v15/peg-orange.png','./assets/art/v15/peg-red.png','./assets/art/v15/peg-white.png','./assets/art/v15/peg-yellow.png','./assets/art/v15/ship-2.png','./assets/art/v15/ship-3.png','./assets/art/v15/ship-4.png','./assets/art/v15/ship-5.png'
];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('game-vault-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{if(e.request.method!=='GET'||new URL(e.request.url).origin!==self.location.origin)return;e.respondWith(caches.match(e.request).then(cached=>cached||fetch(e.request).then(r=>{if(r.ok){const copy=r.clone();caches.open(CACHE).then(c=>c.put(e.request,copy))}return r})))})
