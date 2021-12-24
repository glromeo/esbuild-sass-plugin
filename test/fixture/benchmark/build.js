const esbuild = require('esbuild')
const {sassPlugin} = require('../../../lib')
const chokidar = require('chokidar')
const {cleanFixture} = require('../utils')

cleanFixture(__dirname)

console.time('generate')
require("./generate");
console.timeEnd('generate')

let result

const watcher = chokidar.watch('./src', {ignoreInitial: true})

watcher.on('ready', async function () {

  console.time('initial build')

  result = await esbuild.build({
    entryPoints: ["./src/generated/index.ts"],
    bundle: true,
    format: 'esm',
    sourcemap: false,
    outdir: './out',
    define: {'process.env.NODE_ENV': '"development"'},
    incremental: true,
    plugins: [
      sassPlugin({
        'filter': /^\.\.\/index.scss$/,
        'type': 'style',
        'cache': false
      }),
      sassPlugin({
        'type': 'lit-css',
        'cache': false
      })
    ],
    logLevel: 'debug'
  })

  console.timeEnd('initial build')
})

watcher.on('change', async function () {
  if (result !== null) {
    console.time('incremental build')

    const rebuild = result.rebuild()
    result = null
    result = await rebuild

    console.timeEnd('incremental build')
  }
})
