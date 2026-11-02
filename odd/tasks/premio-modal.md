# Premio modal redesign

Plan: /Users/javiercastro/.claude-havas/plans/hola-te-cuento-que-stateless-pizza.md
Figma: file USHTGtmhbXbIl5a0ve4wSC, nodes 4080:190368 (desktop), 4040:50800 (tablet), 4040:50460 (mobile)
TDD: disabled (no test runner; checks = chrome-devtools + `pnpm build`)
Route: delegated direct, single sonnet writer

## Tasks
- [x] T1 Assets
- [x] T2 Markup + styles (Modal/Premio.astro)
- [x] T3 Behaviour (show/close events, safe data, focus, scroll lock)
- [x] T4 Mount in index.astro
- [x] T5 Wire Ruleta.astro (premio:show / premio:close)
- [x] T6 Verify with chrome-devtools
- [x] T7 pnpm build

## Evidence
- Commits: assets a7531bc, modal+wiring ce132a7, scroll-lock fix (see git log)
- Verified at 1920/1440/1024/768/640/500/390/360 with real AMX fonts injected: geometry matches Figma (desktop 784x546, tablet 600x664, mobile 335x577)
- premio:close emitted once for ESC/X/backdrop/CTA; reset verified; Swal closes before modal; Tab trapped; XSS literal; invalid/empty/404 image hides slot; pnpm build OK
