# Ruleta wheel art + prize geometry + dev harness

Plan: /Users/javiercastro/.claude-havas/plans/hola-te-cuento-que-stateless-pizza.md
Figma: file USHTGtmhbXbIl5a0ve4wSC, wheel 4077:189303, prizes 4159:20323
TDD: disabled (no test runner; checks = chrome-devtools + `pnpm build`)
Route: delegated direct, single sonnet writer

## Tasks
- [x] T1 Branch feat/ruleta-bg from main
- [x] T2 Assets
- [x] T3 Markup + CSS layers (remove old wheel/pointer/lights/items)
- [x] T4 Dev harness (ruletaDev) + seams
- [x] T5 Calibration (cx, cy, disc-r, hub-r)
- [x] T6 Spin angle formula + normalization
- [x] T7 API hydration + API labels + isotipo fade
- [x] T8 Cleanup + build
- [x] T9 chrome-devtools verification

## Progress / evidence
- Rebased onto feat/premio-modal (premio:show / premio:close wiring kept, no Swal for WIN).
- Dev harness: window.ruletaDev only under import.meta.env.DEV; `pnpm build` ok and `rg -l "ruletaDev|fixtures" dist/` empty.
- Geometry calibrated with ruletaDev.debug(true): cx 50.3u, cy 51.12u, disc-r 39.7u, hub-r 14.6u (u = 1% of wheel width).
- checkAll() true and spin(0..5) centred (0 deg error) at 1920/1440/1280/1024/820/768/600/500/390/360; no horizontal overflow.
- Pointer bug: the fixed pointer copy re-drew translucent rim pixels (lighter rectangle) and the arrow tip baked into the rotating disc left a ghost tip. Fixed with ruleta-disc.webp (tip painted out), a pointer layer clipped to the arrow head, and rim/pointer masks that do not overlap.
- Console: only the pre-existing AMX font CORS errors. Five 404s seen during testing were caused by the harness (root-relative placeholder URLs resolved against the API host); fixed.
- Not done: Figma confetti/star sprites; Bonos label shows API name only (no "ADICIONALES").
