const esbuild = require('esbuild')
const {sassPlugin} = require('../../../lib')
const {cleanFixture} = require('../utils')

cleanFixture(__dirname)

console.time('generate')
require('./generate')
console.timeEnd('generate')

esbuild.context({
    entryPoints: ['./src/generated/index.ts'],
    bundle: true,
    format: 'esm',
    sourcemap: false,
    outdir: './out',
    define: {'process.env.NODE_ENV': '"development"'},
    plugins: [
        sassPlugin({
            'filter': /^\.\.\/index.scss$/,
            'type': 'style',
            'cache': false
        }),
        sassPlugin({
            'type': 'lit-css',
            'cache': true
        }), {
            name: 'logger',
            setup({onStart, onEnd}) {
                onStart(() => {
                    console.time('built in')
                })
                onEnd(() => {
                    console.timeEnd('built in')
                })
            }
        }
    ],
    logLevel: 'error'
}).then(async context => {
    await context.watch()
    await context.rebuild()
}).catch(console.error)

