const esbuild = require('esbuild')
const {sassPlugin} = require('../../../lib')
const {cleanFixture, logSuccess, logFailure} = require('../utils')

cleanFixture(__dirname)

esbuild.build({
  entryPoints: ['index.js'],
  outdir: 'out',
  bundle: true,
  format: 'esm',
  sourcemap: true,
  plugins: [
    sassPlugin({
      style: 'compressed',
      quietDeps: true
    })
  ]
}).then(logSuccess, logFailure)
