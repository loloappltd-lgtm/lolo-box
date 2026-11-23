# LOLO BOX — لولو بوكس

Open-world kids game for the Lolo app. Plain HTML + ES modules + Three.js (no build step).

## Run
Serve the folder with any static server and open `index.html`, for example:

```
python3 -m http.server 8080
# then open http://localhost:8080/
```

## Structure
- `index.html` — all screens (start, maps, HUD, panels) and their CSS.
- `js/main.js` — the game: renderer, city, player, cars, missions, screens and the main loop.
- `js/avatar.js` — the blocky (voxel) characters: wardrobe catalogue, the character presets and `makeAvatar(look)`.
- `js/charsel.js` — **Character Selection Screen** (`LOLO_CHARSEL_2026`): 3D voxel lobby, glowing platform, character list, character card, choose button.
- `js/park.js`, `js/home.js` — the amusement park and the house interior.
- `js/three.*.js`, `js/jsm/` — Three.js and its add-ons.
- `assets/` — city/nature kits, map pictures, UI images, fonts (Baloo Bhaijaan 2, SIL Open Font License).

## Character Selection Screen
Flow: start screen → **اختيار الشخصية** (charsel.js) → map selection → game.

- Uses the game's own renderer and toon materials; while it is open `main.js` renders its scene instead of the city.
- Characters are real 3D models built by `avatar.js`; the list thumbnails are rendered from the same models.
- Drag (mouse or touch) to rotate the character; arrow keys / Enter also work.
- Order and card text (description, three attributes, platform colour) live in `CS_ORDER` and `CS_INFO` in `charsel.js`.
- New characters are appended to `NEW_CHARS` in `avatar.js`, so the numbers of the old characters in saved games do not change.
