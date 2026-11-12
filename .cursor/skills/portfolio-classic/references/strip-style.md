# Keep only Classic (经典), remove Atelier

## Delete / stop shipping

- `styles/atelier/` (entire package, including `canvasui/`)
- `app/atelier/`
- Atelier-only fonts in root layout if they become unused (Fraunces / Noto Serif SC) — remove only after confirming classic does not use them
- Do **not** remove classic Vanta stack: `styles/classic/lib`, `styles/classic/vendor`, `vanta`, `three-vanta`

## Registry & Uno

1. `styles/types.ts` — `StyleMode` = `"classic"` only
2. `styles/registry.ts` — register only `classic`
3. `uno.config.ts` — import only `classic` + `shared` uno modules
4. `lib/style.ts` / FOUC scripts — paths only `/classic`
5. Root `app/page.tsx` — redirect to classic

## App shell

- `app/classic/` remains
- Hide or remove `StyleRail` when a single style remains
- Ensure `DEFAULT_STYLE` / storage fallback is `classic`

## Verify

- `npm install`
- `npx tsc --noEmit`
- `npm run dev` → open `/` or `/classic`
- No imports left to `@/styles/atelier`
