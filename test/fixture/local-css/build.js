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
      filter: /\.module\.scss$/,
      type: 'local-css'
    }),
    sassPlugin({
      filter: /\.scss$/,
      type: 'css'
    }),
  ]
}).then(logSuccess, logFailure)