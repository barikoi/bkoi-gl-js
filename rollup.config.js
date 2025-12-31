import typescript from "@rollup/plugin-typescript";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import clear from "rollup-plugin-clear";
import copy from "rollup-plugin-copy";
import terser from "@rollup/plugin-terser";
import dts from "rollup-plugin-dts";

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
