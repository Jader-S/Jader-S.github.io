const isVendored = (file) =>
  file.split(/[/\\]/).includes("vendor") || /\.min\.(js|cjs|mjs)$/.test(file);

/** @param {string[]} files */
function eslintAndPrettier(files) {
  const list = files.filter((file) => !isVendored(file));
  if (list.length === 0) return [];
  const quoted = list.map((file) => JSON.stringify(file)).join(" ");
  return [`eslint --fix --max-warnings 0 ${quoted}`, `prettier --write ${quoted}`];
}

/** @type {import('lint-staged').Configuration} */
export default {
  "{app,components,styles,lib,data,types}/**/*.{js,jsx,ts,tsx,mjs,cjs}": eslintAndPrettier,
  // Root / tooling configs only (avoid re-linting package trees + vendored mins)
  "*.{js,ts,mjs}": (files) =>
    eslintAndPrettier(
      files.filter((file) => !file.includes("/") && !file.includes("\\"))
    ),
  "postcss*.cjs": "prettier --write",
  // Never reformat the embedded ASTRA build output — it is generated, minified
  // and must stay byte-identical to what scripts/sync-astra.mjs produces.
  "*.{json,md,css,yml,yaml}": (files) => {
    const list = files.filter((file) => !file.startsWith("public/"));
    if (list.length === 0) return [];
    return [`prettier --write ${list.map((file) => JSON.stringify(file)).join(" ")}`];
  },
};
