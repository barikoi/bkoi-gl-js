import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from 'rollup-plugin-terser';
import clear from 'rollup-plugin-clear';
import copy from 'rollup-plugin-copy';
import image from '@rollup/plugin-image';

const commonPlugins = [
  image(),
  nodeResolve(),
  commonjs(),
];

export default [
  // IIFE build for browsers (bundled, self-contained)
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/iife/bkoi-gl.js',
      format: 'iife',
      name: 'bkoigl',
      sourcemap: true,
    },
    external: [], // Bundle everything for self-contained browser usage
    plugins: [
      clear({ targets: ['dist/iife'] }),
      ...commonPlugins,
      nodeResolve({
        browser: true, // Resolve for browser environment
        preferBuiltins: false,
      }),
      typescript({
        tsconfig: './tsconfig.json',
        declaration: false,
        declarationMap: false,
        sourceMap: true,
      }),

      copy({
        targets: [
          { src: 'src/index.css', dest: 'dist/iife', rename: 'bkoi-gl.css' },
        ],
      }),
    ],
  },

  // UMD build for browsers (bundled, self-contained)
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/umd/bkoi-gl.js',
      format: 'umd',
      name: 'bkoigl',
      sourcemap: true,
    },
    external: [], // Bundle everything
    plugins: [
      clear({ targets: ['dist/umd'] }),
      ...commonPlugins,
      nodeResolve({
        browser: true,
        preferBuiltins: false,
      }),
      typescript({
        tsconfig: './tsconfig.json',
        declaration: false,
        declarationMap: false,
        sourceMap: true,
      }),

    ],
  },

  // CJS build (external dependencies)
  {
    input: 'src/index.ts',
    external: ['maplibre-gl', 'maplibre-gl-draw'], // Keep external for npm
    output: {
      dir: 'dist/cjs',
      format: 'cjs',
      preserveModules: true,
      exports: 'auto',
      sourcemap: true,
    },
    plugins: [
      clear({ targets: ['dist/cjs'] }),
      ...commonPlugins,
      typescript({
        tsconfig: './tsconfig.json',
        declaration: true,
        declarationDir: './dist/cjs',
        outDir: './dist/cjs',
        rootDir: './src',
        sourceMap: true,
      }),

    ],
  },

  // ESM build (external dependencies)
  {
    input: 'src/index.ts',
    external: ['maplibre-gl', 'maplibre-gl-draw'], // Keep external for npm
    output: {
      dir: 'dist/esm',
      format: 'es',
      preserveModules: true,
      exports: 'auto',
      sourcemap: true,
    },
    plugins: [
      clear({ targets: ['dist/esm', 'dist/style'] }),
      ...commonPlugins,
      typescript({
        tsconfig: './tsconfig.json',
        declaration: true,
        declarationDir: './dist/esm',
        outDir: './dist/esm',
        rootDir: './src',
        sourceMap: true,
      }),

      copy({
        targets: [
          { src: 'src/index.css', dest: 'dist/style', rename: 'bkoi-gl.css' },
        ],
      }),
    ],
  },
];
