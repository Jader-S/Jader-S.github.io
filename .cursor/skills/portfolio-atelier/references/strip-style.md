# Keep only Atelier (静奢), remove Classic

## Delete / stop shipping

- `styles/classic/` (entire package, including `lib/`, `vendor/`)
- `app/classic/`
- Classic-only deps if unused after strip: `vanta`, `three-vanta`, `p5`, `@types/p5` (confirm no atelier imports)
- `types/vanta.d.ts` / `types/three-vanta.d.ts` if nothing references them

## Registry & Uno

1. `styles/types.ts` — `StyleMode` = `"atelier"` only; drop classic from unions if present
2. `styles/registry.ts` — register only `atelier`
3. `uno.config.ts` — import only `atelier` + `shared` uno modules
4. `lib/style.ts` / FOUC scripts — paths only `/atelier`; `/` redirect to atelier
5. Root `app/page.tsx` — redirect to atelier

## App shell

- `app/atelier/` remains the main experience
- Prefer making `/` render atelier directly **or** keep redirect — pick one, keep DX simple
- `StyleRail`: hide when only one style is registered, or remove from `AppProviders`
- i18n `t.style`: can keep labels or simplify; do not leave broken classic links

## Verify

- `npm install`
- `npx tsc --noEmit`
- `npm run dev` → open `/` or `/atelier`
- No imports left to `@/styles/classic` or `vanta`
