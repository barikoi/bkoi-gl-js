// Rollup plugins
import babel from '@rollup/plugin-babel'
import { eslint } from 'rollup-plugin-eslint'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import { terser } from 'rollup-plugin-terser'
import clear from 'rollup-plugin-clear'
import copy from 'rollup-plugin-copy'

export default [
    {
        input: 'src/index.js',
        output: {
            file: 'dist/bkoi-gl.js',
            format: 'iife',
            name: 'bkoigl',
            globals: {
                'maplibre-gl': 'maplibre'
            }
        },
        plugins: [
            clear({ targets: ['dist'] }),
            nodeResolve(),
            commonjs(),
            eslint(),
            babel({
                exclude: 'node_modules/**',
                babelHelpers: 'bundled'
            }),
            terser(),
            copy({
                targets: [
                    { src: 'src/index.css', dest: 'dist', rename: 'bkoi-gl.css' }
                ]
            })
        ]
    }
]