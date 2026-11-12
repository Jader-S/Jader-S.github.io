/**
 * Sync the ASTRA production build (E:\Jader\blog\dist) into this Next.js
 * project as an isolated static sub-app under public/embed/astra/.
 *
 * IMPORTANT: this script is READ-ONLY with respect to the ASTRA project.
 * It never writes to ../blog. It only copies ../blog/dist and rewrites
 * absolute asset paths so they resolve under the embed prefix.
 *
 * Usage:
 *   node scripts/sync-astra.mjs
 *
 * Env overrides:
 *   ASTRA_DIST        path to ASTRA dist (default ../blog/dist)
 *   ASTRA_BASE        URL prefix of the embed      (default /embed/astra)
 *   ASTRA_ROUTER_BASE BrowserRouter start path     (default /)
 *
 * If you deploy under a GitHub Pages project subpath (basePath=/portfolio),
 * run with ASTRA_BASE=/portfolio/embed/astra ASTRA_ROUTER_BASE=/portfolio/
 * BEFORE building, otherwise assets will 404.
 */
import { cp, mkdir, readdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SRC = path.resolve(process.env.ASTRA_DIST || path.join(root, "..", "blog", "dist"));
const DEST = path.resolve(root, "public", "embed", "astra");
const BASE = (process.env.ASTRA_BASE || "/embed/astra").replace(/\/$/, "");
const ROUTER_BASE = process.env.ASTRA_ROUTER_BASE || "/";

const TEXT_EXT = new Set([".html", ".htm", ".js", ".mjs", ".css", ".json", ".svg", ".txt", ".xml"]);
const ASSET_DIRS = ["assets", "textures", "qa-agent", "models", "fonts"];

/**
 * Rewrite asset references to BASE-prefixed absolute paths.
 *
 * Two shapes matter:
 *   1. "/assets/x.js"     — hardcoded absolute paths in HTML/JS/CSS
 *   2. "assets/x.js"      — Vite's __vite__mapDeps preload list. These are
 *      resolved by __vitePreload via `new URL(dep, document.baseURI)`.
 *      The boot script rewrites the iframe URL to "/", so leaving them
 *      relative makes every lazy chunk request "/assets/x.js" -> 404.
 *      Making them absolute removes the dependence on document.baseURI.
 */
function rewrite(text) {
  let out = text;
  for (const dir of ASSET_DIRS) {
    // quoted / template-literal paths: "/assets/x.js", '/textures/x.jpg'
    out = out.replace(new RegExp(`(["'\`])/(${dir})/`, "g"), `$1${BASE}/${dir}/`);
    // relative quoted paths: "assets/x.js" (Vite lazy-chunk preload deps)
    out = out.replace(new RegExp(`(["'\`])(${dir})/`, "g"), `$1${BASE}/${dir}/`);
    // css: url(/textures/x.jpg) and url(assets/x.jpg)
    out = out.replace(new RegExp(`url\\(/?(${dir})/`, "g"), `url(${BASE}/${dir}/`);
  }
  return out;
}

/**
 * Vite's preload helper hardcodes `"/" + dep` for every lazy dependency.
 * Our deps are already absolute BASE paths, so that would produce
 * "//embed/astra/assets/x.js" — a protocol-relative URL whose host is
 * literally "embed". Pass absolute deps through, keep relative ones working.
 */
function fixPreloadHelper(text) {
  return text.replace(
    /function\((\w+)\)\{return"\/"\+\1\}/g,
    (_m, arg) => `function(${arg}){return ${arg}.charAt(0)==="/"?${arg}:"/"+${arg}}`,
  );
}

/** ASTRA uses BrowserRouter without a basename; start it at ROUTER_BASE inside the iframe. */
function injectBoot(html) {
  const boot = `<script>try{history.replaceState(null,"",${JSON.stringify(ROUTER_BASE)})}catch(e){}</script>`;
  return html.replace(/<head([^>]*)>/i, `<head$1>${boot}`);
}

async function walk(dir, rel = "", acc = []) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const r = rel ? `${rel}/${entry.name}` : entry.name;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) await walk(full, r, acc);
    else if (entry.isFile()) acc.push(r);
  }
  return acc;
}

async function main() {
  const srcInfo = await stat(SRC).catch(() => null);
  if (!srcInfo?.isDirectory()) {
    throw new Error(`ASTRA dist not found: ${SRC}\nBuild it in the ASTRA project first: npm run build`);
  }

  const indexHtml = await readFile(path.join(SRC, "index.html"), "utf8").catch(() => null);
  if (!indexHtml || !indexHtml.includes("/assets/")) {
    throw new Error(`${SRC}/index.html does not look like a production build (no /assets/ refs).`);
  }

  await rm(DEST, { recursive: true, force: true });
  await mkdir(DEST, { recursive: true });

  const files = await walk(SRC);
  let rewritten = 0;
  let copied = 0;

  for (const rel of files) {
    const from = path.join(SRC, rel);
    const to = path.join(DEST, rel);
    await mkdir(path.dirname(to), { recursive: true });
    const ext = path.extname(rel).toLowerCase();

    if (TEXT_EXT.has(ext)) {
      let text = await readFile(from, "utf8");
      let next = rewrite(text);
      if (ext === ".js" || ext === ".mjs") next = fixPreloadHelper(next);
      if (/<head/i.test(next) && (ext === ".html" || ext === ".htm")) {
        text = injectBoot(next);
      } else {
        text = next;
      }
      if (text !== (await readFile(from, "utf8"))) rewritten++;
      await writeFile(to, text, "utf8");
    } else {
      await cp(from, to);
    }
    copied++;
  }

  const finalHtml = await readFile(path.join(DEST, "index.html"), "utf8");
  const ok = finalHtml.includes(`${BASE}/assets/`) && !finalHtml.includes('src="/assets/');

  // Runtime self-check: a quoted "/assets/..." or "assets/..." reference is
  // resolved against document.baseURI, which the boot script resets to "/".
  // Any leftover reference means lazy chunks will 404 in the iframe.
  const leakRe = new RegExp(`(["'\`])/?(${ASSET_DIRS.join("|")})/`, "g");
  const leaks = [];
  for (const rel of files) {
    if (!TEXT_EXT.has(path.extname(rel).toLowerCase())) continue;
    const text = await readFile(path.join(DEST, rel), "utf8");
    const hits = text.match(leakRe);
    if (hits) leaks.push(`${rel} (${hits.length} unprefixed refs)`);
    if (/return"\/"\+\w+/.test(text)) leaks.push(`${rel} (unpatched preload helper)`);
    if (text.includes(`"//${BASE.slice(1)}/`)) leaks.push(`${rel} (protocol-relative embed path)`);
  }

  console.log(`[sync-astra] src     : ${SRC}`);
  console.log(`[sync-astra] dest    : ${DEST}`);
  console.log(`[sync-astra] prefix  : ${BASE}`);
  console.log(`[sync-astra] files   : ${copied} (${rewritten} text files rewritten)`);
  console.log(`[sync-astra] boot    : history.replaceState -> ${ROUTER_BASE}`);
  console.log(`[sync-astra] verify  : ${ok ? "OK — all absolute asset paths prefixed" : "FAILED — check index.html"}`);
  console.log(`[sync-astra] audit   : ${leaks.length ? `FAILED — ${leaks.join(", ")}` : "OK — no baseURI-relative asset refs left"}`);
  if (!ok || leaks.length) process.exitCode = 1;
}

main().catch((err) => {
  console.error(`[sync-astra] ${err.message}`);
  process.exitCode = 1;
});
