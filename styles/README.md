# Styles packages

Portfolio visual styles are isolated packages under `styles/`, plus a small shared layer.

```
styles/
  registry.ts          # catalog — register new styles here
  types.ts             # StyleDefinition contract
  shared/
    chrome/            # StyleRail, ThemeToggle, LocaleToggle, SkillShareRail
    providers/         # AppProviders, StyleProvider
    uno/               # shared Uno shortcuts / preflight
  atelier/             # 静奢
    meta.ts            # id, path, favicon, chrome variant
    uno.ts             # tokens + shortcuts (only this style)
    index.ts           # Home entry
    components/
  classic/             # 经典
    meta.ts
    uno.ts
    index.ts
    components/
    lib/               # classic-only (e.g. Vanta THREE)
    vendor/            # classic-only vendored scripts
  particle/            # 粒子
    meta.ts
    uno.ts
    index.ts
    assets.ts          # section silhouette pool
    components/        # Home, ParticleStage, snap scroll
    engine/            # Three.js particle morph + camera
  blueprint/           # 蓝图
    meta.ts
    uno.ts
    index.ts
    SOURCE.md          # swarm provenance
    components/        # BuildPhase + settled portfolio
    swarm/             # vendored swarm-page-builder module
```

## Add a new style

1. Create `styles/<id>/` with `meta.ts`, `uno.ts`, `index.ts`, `components/`
2. Register in `styles/registry.ts`
3. Extend `StyleMode` in `styles/types.ts` and i18n `t.style.<id>`
4. Add `app/<id>/page.tsx` + `layout.tsx`
5. Spread the new `uno.ts` into root `uno.config.ts`

Shared content (`data/`, `lib/i18n`) stays outside style packages.
App shell bits that are not style-specific stay in `components/` (I18n, Theme, Viewport, SkipLink).
