import typescript from "@rollup/plugin-typescript";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import clear from "rollup-plugin-clear";
import copy from "rollup-plugin-copy";
import terser from "@rollup/plugin-terser";
import dts from "rollup-plugin-dts";
import esbuild from "esbuild";
import fs from "node:fs";
import path from "node:path";

// maplibre-gl v6 ships prebuilt es2022 dist (static blocks, #private fields).
// Older consumer toolchains can't handle it: Next 13's pinned SWC minifier
// corrupts it at runtime ("symbolInstance.crossTileID can't be 0", blank map),
// and CRA5's react-scripts parser hard-fails on it. Lower dependency code to
// es2020 at bundle time — together with the worker bundle (see
// scripts/build-worker.mjs, same target) the whole published package stays
// free of es2022 syntax.
const lowerDepSyntax = () => ({
  name: "lower-dependency-syntax-to-es2020",
  async transform(code, id) {
    if (!/node_modules/.test(id) || !/\.[cm]?js$/.test(id.split("?", 1)[0]))
      return null;
    const out = await esbuild.transform(code, {
      target: ["es2020"],
      loader: "js",
      sourcefile: id,
      sourcemap: true,
    });
    return { code: out.code, map: JSON.parse(out.map) };
  },
});

// Turbopack (Next 16) statically analyzes `new URL(<dynamic>, import.meta.url)`
// as an asset import and hard-fails the build ("Can't resolve ('' | <dynamic>)")
// on maplibre v6's cross-origin worker blob-wrapper. The base argument there
// is dead code: that path only receives absolute URLs (relative ones resolve
// same-origin and take the direct-construction branch), so `new URL(x)` is
// semantically identical. Strip the base on maplibre modules only.
const stripDynamicImportMetaUrlBase = () => ({
  name: "strip-dynamic-import-meta-url-base",
  transform(code, id) {
    if (!/maplibre-gl/.test(id) || !code.includes("import.meta.url")) return null;
    const patched = code.replace(
      /new URL\(([$\w]+)\s*,\s*import\.meta\.url\)/g,
      "new URL($1)"
    );
    return patched === code ? null : { code: patched, map: null };
  },
});

// Build dist/style/bkoi-gl.css by concatenating the vendor stylesheets
// (maplibre-gl, maplibre-gl-draw) with src/index.css. The stylesheet must ship
// fully self-contained: remote @import url(https://unpkg.com/...) broke
// consumers twice over — the draw URL 404s (maplibre-gl-draw@1.6.9 ships
// `mapbox-gl-draw.css`, not `maplibre-gl-draw.css`), and a stylesheet whose
// @import fails never fires `load` on its <link> in Chrome, so Angular's
// inlineCritical deferral (media="print" onload="this.media='all'") never
// recovered. Inlining also pins the CSS to the exact bundled dependency
// versions instead of whatever unpkg serves that day.
// Order matters: vendor sheets first, Barikoi overrides after (see the
// cascade note at the top of src/index.css).
const bundleStyles = () => ({
  name: "bundle-vendor-styles",
  writeBundle() {
    const vendorSheets = [
      "node_modules/maplibre-gl/dist/maplibre-gl.css",
      "node_modules/maplibre-gl-draw/dist/mapbox-gl-draw.css",
    ].map((file) => fs.readFileSync(path.resolve(file), "utf8"));
    const ownSheet = fs.readFileSync(path.resolve("src/index.css"), "utf8");
    fs.mkdirSync(path.resolve("dist/style"), { recursive: true });
    fs.writeFileSync(
      path.resolve("dist/style/bkoi-gl.css"),
      [...vendorSheets, ownSheet].join("\n")
    );
  },
});

// Shared configurations
const commonOutput = {
  exports: "named",
  sourcemap: true,
};

const typescriptConfig = {
  tsconfig: "./tsconfig.json",
  compilerOptions: {
    declaration: false,
    declarationMap: false,
    outDir: "dist",
    removeComments: true,
  },
};

const terserConfig = {
  compress: { passes: 2 },
  format: { comments: false },
};

const nodeResolveBrowser = nodeResolve({
  browser: true,
  preferBuiltins: false,
});

const nodeResolveNode = nodeResolve({
  browser: false,
  preferBuiltins: true,
});

export default [
  // Browser builds (IIFE & UMD - all dependencies bundled, minified)
  {
    input: "src/index.ts",
    output: [
      {
        ...commonOutput,
        file: "dist/iife/bkoi-gl.js",
        format: "iife",
        name: "bkoigl",
        compact: true,
      },
      {
        ...commonOutput,
        file: "dist/umd/bkoi-gl.js",
        format: "umd",
        name: "bkoigl",
        compact: true,
      },
    ],
    external: [],
    plugins: [
      clear({ targets: ["dist"] }),
      nodeResolveBrowser,
      commonjs(),
      lowerDepSyntax(),
      typescript(typescriptConfig),
      bundleStyles(),
      copy({
        targets: [
          // maplibre-gl v6 loads its worker at runtime from files sibling to
          // the entry; the worker itself imports the shared chunk. Each format
          // resolves these next to its own output dir.
          { src: "node_modules/maplibre-gl/dist/maplibre-gl-worker.mjs", dest: "dist" },
          { src: "node_modules/maplibre-gl/dist/maplibre-gl-shared.mjs", dest: "dist" },
          { src: "node_modules/maplibre-gl/dist/maplibre-gl-worker.mjs", dest: "dist/umd" },
          { src: "node_modules/maplibre-gl/dist/maplibre-gl-shared.mjs", dest: "dist/umd" },
          { src: "node_modules/maplibre-gl/dist/maplibre-gl-worker.mjs", dest: "dist/iife" },
          { src: "node_modules/maplibre-gl/dist/maplibre-gl-shared.mjs", dest: "dist/iife" },
        ],
      }),
      terser(terserConfig),
    ],
  },

  // Library builds (CJS & ESM - all dependencies bundled)
  {
    input: "src/index.ts",
    output: [
      { ...commonOutput, file: "dist/index.cjs", format: "cjs" },
      { ...commonOutput, file: "dist/index.js", format: "es" },
    ],
    external: [],
    plugins: [
      nodeResolveNode,
      stripDynamicImportMetaUrlBase(),
      commonjs(),
      lowerDepSyntax(),
      typescript(typescriptConfig),
      terser(terserConfig),
    ],
  },

  // TypeScript declarations
  {
    input: "src/index.ts",
    output: [{ file: "dist/index.d.ts" }, { file: "dist/index.d.cts" }],
    external: ["maplibre-gl", "maplibre-gl-draw", /\.css$/],
    plugins: [dts()],
  },
];
