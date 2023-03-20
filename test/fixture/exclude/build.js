const esbuild = require('esbuild')
const {sassPlugin, postcssModules} = require('../../../lib')
const {cleanFixture, logSuccess, logFailure} = require('../utils')

cleanFixture(__dirname)

esbuild.build({
  entryPoints: ['./src/index.js'],
  outdir: './out',
  outExtension: { '.js': '.mjs' },
  bundle: true,
  format: 'esm',
  plugins: [
    sassPlugin({
      external: /^\.\.\/external/,
      exclude: /\.module\.scss$/,
      type: 'css'
    }),
    sassPlugin({
      transform: postcssModules({
        generateScopedName: '[hash:base64:8]--[local]',
        localsConvention: 'camelCaseOnly'
      }),
      type: 'style'
    })
  ]
}).then(logSuccess, logFailure)

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
// DON'T FOLLOW THIS EXAMPLE!!!
//
// This has been setup this way to test the exclude option, a better setup would have been to just declare the
// plugins in the inverse order and use filter instead of exclude.
//
// plugins: [
//   sassPlugin({
//     filter: `\.module\.scss$`
//     transform: postcssModules({
//       generateScopedName: '[hash:base64:8]--[local]',
//       localsConvention: 'camelCaseOnly'
//     })
//   }),
//   sassPlugin({
//     type: 'style'
//   })
// ]
//
//
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
