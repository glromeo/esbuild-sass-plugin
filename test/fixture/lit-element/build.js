const esbuild = require('esbuild')
const {sassPlugin} = require('../../../lib')
const {cleanFixture, logSuccess, logFailure} = require('../utils')

cleanFixture(__dirname)

esbuild.build({
  entryPoints: ['src/index.ts'],
  outdir: 'out',
  bundle: true,
  format: 'esm',
  plugins: [
    sassPlugin({
      filter: /index.scss$/,
      type: 'style'
    }),
    sassPlugin({
      type: 'lit-css'
    })
  ]
}).then(logSuccess, logFailure)
