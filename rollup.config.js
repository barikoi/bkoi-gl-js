// Rollup plugins
import babel from '@rollup/plugin-babel'
import { eslint } from 'rollup-plugin-eslint'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import { uglify } from 'rollup-plugin-uglify'

export default {
    input: './src/index.js',
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
        uglify()
    ]
}