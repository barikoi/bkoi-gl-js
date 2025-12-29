import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import clear from 'rollup-plugin-clear';
import copy from 'rollup-plugin-copy';
import image from '@rollup/plugin-image';
import dts from 'rollup-plugin-dts';

const commonPlugins = [
  image(),
  nodeResolve(),
  commonjs(),
];

export default [
  // 1. Browser Builds (IIFE & UMD)
  {
    input: 'src/index.ts',
    output: [
      {
        file: 'dist/iife/bkoi-gl.js',
        format: 'iife',
        name: 'bkoigl',
        sourcemap: true, 
      },
      {
        file: 'dist/umd/bkoi-gl.js',
        format: 'umd',
        name: 'bkoigl',
        sourcemap: true, 
      }
    ],
    external: [],
    plugins: [
      clear({ targets: ['dist'] }), 
      ...commonPlugins,
      nodeResolve({ browser: true, preferBuiltins: false }),
      typescript({
        tsconfig: './tsconfig.json',
        declaration: false,
        declarationMap: false,
        sourceMap: true,
      }),
      copy({
        targets: [
          { src: 'src/index.css', dest: 'dist/style', rename: 'bkoi-gl.css' },
          { src: 'src/index.css', dest: 'dist/iife', rename: 'bkoi-gl.css' }, 
        ],
      }),
    ],
  },

  // 2. Bundled CJS & ESM (Single files)
  {
    input: 'src/index.ts',
    external: ['maplibre-gl', 'maplibre-gl-draw'],
    output: [
      {
        file: 'dist/index.cjs',
        format: 'cjs',
        exports: 'named',
        sourcemap: true,
      },
      {
        file: 'dist/index.js',
        format: 'es',
        exports: 'named',
        sourcemap: true,
      }
    ],
    plugins: [
      ...commonPlugins,
      typescript({
        tsconfig: './tsconfig.json',
        declaration: false, 
        declarationMap: false,
        sourceMap: true,
      }),
    ],
  },

  // 3. Type Definitions (Bundled into one file)
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.d.ts',
      format: 'es',
    },
    external: ['maplibre-gl', 'maplibre-gl-draw', /\.css$/], 
    plugins: [dts()],
  },
];
