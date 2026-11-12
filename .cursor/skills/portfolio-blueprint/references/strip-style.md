# Keep only Blueprint (蓝图), remove other styles

## Delete / stop shipping

- `styles/atelier/`
- `styles/classic/` (including `lib/`, `vendor/`)
- `styles/particle/` (including `engine/`, `assets.ts`)
- `app/atelier/`, `app/classic/`, `app/particle/`
- Classic-only deps if unused after strip: `vanta`, `three-vanta`, `p5`, `@types/p5`
- Particle-only Three usage if unused: confirm whether `three` is still needed (blueprint swarm does not use Three)
- Related favicons / public assets only used by removed styles
- `types/vanta.d.ts` / `types/three-vanta.d.ts` if nothing references them

## Registry & Uno

1. `styles/types.ts` — `StyleMode` = `"blueprint"` only
2. `styles/registry.ts` — register only `blueprint`
3. `uno.config.ts` — import only `blueprint` + `shared` uno modules
4. `lib/style.ts` / FOUC scripts — paths only `/blueprint`; `/` redirect to blueprint
5. Root `app/page.tsx` — redirect to blueprint

## App shell

- `app/blueprint/` remains the main experience
- Prefer making `/` render blueprint directly **or** keep redirect — pick one
- `StyleRail`: hide when only one style is registered, or remove from settled chrome
- i18n `t.style`: can keep labels or simplify; do not leave broken style links

## Verify

- `npm install`
- `npx tsc --noEmit`
- `npm run dev` → open `/` or `/blueprint`
- No imports left to `@/styles/atelier`, `@/styles/classic`, or `@/styles/particle`
