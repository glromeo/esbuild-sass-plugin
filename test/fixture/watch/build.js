const esbuild = require('esbuild')
const {sassPlugin} = require('../../../lib')
const {cleanFixture, logSuccess, logFailure} = require('../utils')

cleanFixture(__dirname)

esbuild.context({
  entryPoints: ['src/index.js'],
  outdir: 'out',
  bundle: true,
  plugins: [
    sassPlugin({type: 'css-text'}),
    {
      name: 'listener',
      setup(build) {
        build.onEnd(({errors, warnings}) => {
          if (errors.length) console.error('watch build failed:', errors)
          else if (warnings.length) console.log('watch build succeeded with', warnings, 'warnings')
          else console.log('watch build succeeded')
        })
      }
    }
  ]
}).then(ctx => ctx.watch())
