const esbuild = require('esbuild')
const {sassPlugin} = require('../../../lib')
const {cleanFixture, logSuccess, logFailure} = require('../utils')

cleanFixture(__dirname)

esbuild.build({
  entryPoints: ['./src/index.js'],
  outdir: './out',
  outExtension: { '.js': '.mjs' },
  bundle: true,
  format: 'esm',
  external: ['*/external/'],
  plugins: [
    sassPlugin({
      type: 'css'
    })
  ]
}).then(logSuccess, logFailure)
