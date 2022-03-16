// Rollup plugins
import babel from '@rollup/plugin-babel'
import { eslint } from 'rollup-plugin-eslint'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import { terser } from 'rollup-plugin-terser'
import clear from 'rollup-plugin-clear'
import copy from 'rollup-plugin-copy'
import image from '@rollup/plugin-image'

export default [
    {
        input: 'src/index.js',
        output: {
            file: 'dist/iife/bkoi-gl.js',
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
            image(),
            eslint(),
            babel({
                exclude: 'node_modules/**',
                babelHelpers: 'bundled'
            }),
            terser(),
            copy({
                targets: [
                    { src: 'src/index.css', dest: 'dist/iife', rename: 'bkoi-gl.css' }
                ]
            })
        ]
    },
    {
        input: 'src/index.js',
        external: [ /@babel\/runtime/, 'maplibre-gl' ],
        output: [
            {
                file: 'dist/cjs/bkoi-gl.js',
                format: 'cjs',
                exports: 'auto'
            },
            {
                file: 'dist/esm/bkoi-gl.js',
                format: 'es',
                exports: 'auto'
            }
        ],
        plugins: [
            clear({ targets: [ 'dist/cjs', 'dist/esm', 'dist/style' ] }),
            nodeResolve(),
            commonjs(),
            image(),
            eslint(),
            babel({
                exclude: 'node_modules/**',
                babelHelpers: 'runtime',
                plugins: [ '@babel/plugin-transform-runtime' ]
            }),
            terser(),
            copy({
                targets: [
                    { src: 'src/index.css', dest: 'dist/style', rename: 'bkoi-gl.css' }
                ]
            })
        ]
    }
]