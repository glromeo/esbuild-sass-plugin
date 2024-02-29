const esbuild = require('esbuild')
const {sassPlugin} = require('../../../lib')
const {cleanFixture, logSuccess, logFailure} = require('../utils')

cleanFixture(__dirname)

esbuild.build({
  entryPoints: ['./src/index.js'],
  outdir: './out',
  bundle: true,
  format: 'esm',
  plugins: [
    sassPlugin({
      type: 'local-css'
    }),
  ]
}).then(logSuccess, logFailure)