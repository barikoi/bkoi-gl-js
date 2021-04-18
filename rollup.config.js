// Rollup plugins
import babel from '@rollup/plugin-babel'
import { eslint } from 'rollup-plugin-eslint'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import { terser } from 'rollup-plugin-terser'

export default [
    {
        input: './src/bkoi-gl.js',
        output: {
            file: './dist/bkoi-gl.js',
            format: 'iife',
            name: 'bkoigl',
            globals: {
                'maplibre-gl': 'maplibre'
            }
        },
        plugins: [
            nodeResolve(),
            commonjs(),
            eslint(),
            babel({
                exclude: 'node_modules/**',
                babelHelpers: 'bundled'
            }),
            terser()
        ]
    },
    {
        input: './src/bkoi-gl-draw.js',
        output: {
            file: './dist/bkoi-gl-draw.js',
            format: 'iife',
            name: 'bkoidraw',
            globals: {
                '@mapbox/mapbox-gl-draw': 'mapboxdraw'
            }
        },
        plugins: [
            nodeResolve(),
            commonjs(),
            eslint(),
            babel({
                exclude: 'node_modules/**',
                babelHelpers: 'bundled'
            }),
            terser()
        ]
    }
]