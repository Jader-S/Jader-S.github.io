---
name: portfolio-blueprint
description: >-
  Scaffold a personal portfolio from Luzhaotian's GitHub using the Blueprint (蓝图)
  visual style with a swarm-cursors opening ceremony. Use when the user wants
  蓝图/blueprint portfolio, clone this template, fill site-content.yaml, or
  optionally learn GitHub signup, git push, and GitHub Pages / Vercel deploy.
disable-model-invocation: false
---

# Portfolio · Blueprint（蓝图）

Source template: `https://github.com/Luzhaotian/portfolio`

This skill scaffolds a **single-style** site kept as **blueprint / 蓝图**.

## Mandatory confirmations (ask before coding)

Use the AskQuestion tool when available; otherwise ask clearly in chat.

1. **Style confirm** — Default is Blueprint. Ask: keep **蓝图 (blueprint)** or switch to **静奢 (atelier)** / **经典 (classic)** / **粒子 (particle)**?
   - If user chooses another style → stop and follow that style’s skill instead.
2. **Content mode**
   - **Fill now**: collect profile / about / skills / projects (can be partial)
   - **Preview only**: skip personal facts; use root `site-content.yaml` placeholders
3. **Target directory** — empty folder or new clone path
4. **Go live? (optional)** — Ask whether they also want help with:
   - GitHub account signup (if needed)
   - Creating their own repo + commit / push
   - Deploy (GitHub Pages recommended; Vercel optional)
   - If they only want local preview, **skip** go-live entirely — do not force it

Do **not** invent the user's real bio. Placeholders only when previewing.

## Workflow

### 1) Obtain code

```bash
git clone https://github.com/Luzhaotian/portfolio.git <target>
cd <target>
```

If the user already has the repo open, work in-place (still confirm style + content mode).

### 2) Content file

- Ensure repo-root `site-content.yaml` exists (template ships in the repo).
- If **fill now**: update YAML with user answers (`meta.mode: ready`, `preferredStyle: blueprint`).
- If **preview**: keep placeholders; set `meta.mode: preview`, `preferredStyle: blueprint`.
- Tell the user they can edit `site-content.yaml` anytime and ask the agent to re-apply.

### 3) Keep only Blueprint

Follow `references/strip-style.md`.

### 4) Apply content into code

Follow `references/apply-content.md`.
Replace Luzhaotian-specific copy in `data/*` and `lib/i18n/locales/*`.

### 5) Install & verify

```bash
npm install
npx tsc --noEmit
npm run dev
```

Open the blueprint route (usually `/` → `/blueprint`). Desktop: short swarm construction intro, then settled portfolio; reduced-motion / mobile skips straight to settled.

### 6) Go live (only if user opted in)

Follow `references/go-live.md`：注册 GitHub（如需要）→ 自有仓库 → commit / push → GitHub Pages（或 Vercel）。

Local success alone is enough to mark the scaffold done when go-live was declined.

## Architecture hints

- Styles live under `styles/blueprint` (see `styles/README.md`).
- Opening ceremony: `styles/blueprint/swarm/` (vendored swarm-page-builder module) + `components/BuildPhase.tsx`.
- Settled page: `styles/blueprint/components/*` using shared `data/` + i18n.
- Provenance: `styles/blueprint/SOURCE.md`.
- Shared chrome: `styles/shared/*`. App shell providers: `components/*`.

## Done criteria

- [ ] User confirmed blueprint (or redirected to another style skill)
- [ ] `site-content.yaml` present and explained
- [ ] Other style packages removed / unreachable
- [ ] `npm run dev` shows `/blueprint`
- [ ] Optional go-live only if requested
