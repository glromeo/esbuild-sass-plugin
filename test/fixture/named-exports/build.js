const esbuild = require('esbuild')
const {sassPlugin, postcssModules} = require('../../../lib')
const {cleanFixture, logSuccess, logFailure} = require('../utils')

cleanFixture(__dirname)

esbuild.build({
  entryPoints: ['./src/index.js'],
  outdir: './out',
  bundle: true,
  format: 'esm',
  plugins: [
    sassPlugin({
      transform: postcssModules({
        generateScopedName: '[hash:base64:8]--[local]',
        localsConvention: 'camelCaseOnly'
      }),
      namedExports: (name) => {
        return `${name.replace(/-/g, "_")}`
      },
    })
  ]
}).then(logSuccess, logFailure)