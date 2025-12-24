import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { terser } from 'rollup-plugin-terser';
import clear from 'rollup-plugin-clear';
import copy from 'rollup-plugin-copy';
import image from '@rollup/plugin-image';

const commonPlugins = [
  image(),
  nodeResolve(),
  commonjs(),
];

export default [
  // IIFE build for browsers
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/iife/bkoi-gl.js',
      format: 'iife',
      name: 'bkoigl',
      sourcemap: true,
      globals: {
        'maplibre-gl': 'maplibre',
        'maplibre-gl-draw': 'MapboxDraw',
      },
    },
    external: ['maplibre-gl', 'maplibre-gl-draw'],
    plugins: [
      clear({ targets: ['dist/iife'] }),
      ...commonPlugins,
      typescript({
        tsconfig: './tsconfig.json',
        declaration: false,
        declarationMap: false,
        sourceMap: true,
      }),
      terser(),
      copy({
        targets: [
          { src: 'src/index.css', dest: 'dist/iife', rename: 'bkoi-gl.css' },
        ],
      }),
    ],
  },
  
  // CJS build
  {
    input: 'src/index.ts',
    external: ['maplibre-gl', 'maplibre-gl-draw'],
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
      terser(),
    ],
  },

  // ESM build
  {
    input: 'src/index.ts',
    external: ['maplibre-gl', 'maplibre-gl-draw'],
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
      terser(),
      copy({
        targets: [
          { src: 'src/index.css', dest: 'dist/style', rename: 'bkoi-gl.css' },
        ],
      }),
    ],
  },
];
