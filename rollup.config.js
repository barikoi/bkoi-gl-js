import typescript from "@rollup/plugin-typescript";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import clear from "rollup-plugin-clear";
import copy from "rollup-plugin-copy";
import terser from "@rollup/plugin-terser";
import dts from "rollup-plugin-dts";

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
      typescript(typescriptConfig),
      copy({
        targets: [
          { src: "src/index.css", dest: "dist/style", rename: "bkoi-gl.css" },
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
