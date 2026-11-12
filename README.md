# ASTRA

一个前端工程师的太空站。3D 星图导航 + 可交互 Demo 展示，暗黑太空 / 霓虹 HUD 视觉。

在线地址：<https://jader-s.github.io/>

## Tech stack

Vite 5 · React 18 · TypeScript · React Three Fiber / drei / three · GSAP · Zustand · Sandpack · MDX · Vitest

## Local development

```bash
npm ci
npm run dev        # http://localhost:5173
npm run build      # tsc -b && vite build -> dist/
npm run preview
npm test
```

## Deployment

Push to `main` triggers `.github/workflows/pages.yml`: `npm ci` → `npm run build` → copy `index.html` to `404.html` (SPA deep-link fallback) → upload artifact → deploy to GitHub Pages.

The site is fully static. The embedded `qa-agent` demo runs entirely in the browser; any API key entered there stays in local storage and is never sent to a server controlled by this site.

## Structure

| Path | Purpose |
|---|---|
| `src/three/` | Galaxy scene, planets, camera rig |
| `src/pages/` | Home / Projects / Demos / Blog / About / Contact |
| `src/demos/` | Demo registry |
| `src/content/` | MDX articles and project content |
| `public/textures/` | Planet textures and universe backdrop |
| `public/qa-agent/` | Prebuilt standalone demo embedded as a static sub-app |
