# Participa redesign

Plan: /Users/javiercastro/.claude-havas/plans/hola-te-cuento-que-stateless-pizza.md
Figma: file USHTGtmhbXbIl5a0ve4wSC, nodes 4094:172083 (desktop), 4141:20313 (tablet), 4141:20322 (mobile)
TDD: disabled (no test runner; checks = chrome-devtools visual + `pnpm build`)
Route: delegated direct, single sonnet writer (2+ non-trivial files)

## Tasks
- [x] T1 Assets (photos, svgs) - ec3b658; 4 webp (560w) + 7 svg, no raster in svgs, no figma URLs
- [x] T2 Data + markup - bf18d91; 4 cards render, no new console errors
- [x] T3 Shape/badge/text CSS - bf18d91; checked at 390/360 mobile and 1440
- [x] T4 Desktop staggered layout (>=1280) - bf18d91; checked 1920/1440/1280, no overflow
- [x] T5 Swiper (1/2/3 slides, custom arrows) - bf18d91; 768/820 -> 2, 1024/1279 -> 3, 360/390 -> 1; resize round trip clean
- [x] T6 Decorative layer - bf18d91; scrollWidth === clientWidth at all widths
- [x] T7 Hover (image + badge only) - bf18d91; zoom scale(1.05) on hovered card only
- [x] T8 Script cleanup (modal guard, tabpasos) - bf18d91; modal opens/closes from .btnOpenModal, ?tabpasos=1 scrolls to 135px offset
- [x] T9 Cleanup + pnpm build - CardSlider and card_*.webp removed, build OK
