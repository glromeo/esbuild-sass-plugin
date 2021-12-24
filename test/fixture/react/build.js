const esbuild = require('esbuild')
const {sassPlugin} = require('../../../lib')
const {cleanFixture, logSuccess, logFailure} = require('../utils')

cleanFixture(__dirname)

esbuild.build({
  entryPoints: ['src/index.tsx'],
  outdir: 'out',
  bundle: true,
  format: 'esm',
  define: {'process.env.NODE_ENV': '"production"'},
  plugins: [
    sassPlugin()
  ]
}).then(logSuccess, logFailure)
