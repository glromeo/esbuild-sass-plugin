const esbuild = require('esbuild')
const {sassPlugin} = require('../../../lib')
const {cleanFixture, logSuccess, logFailure} = require('../utils')

cleanFixture(__dirname)

const postCSS = require('postcss')([
  require('autoprefixer'),
  require('postcss-preset-env')({stage: 0})
])

esbuild.build({
  entryPoints: ['./src/app.css'],
  outdir: './out',
  bundle: true,
  loader: {
    '.jpg': 'dataurl'
  },
  plugins: [sassPlugin({
    async transform(source) {
      const {css} = await postCSS.process(source, {from: undefined})
      return css
    }
  })]
}).then(logSuccess, logFailure)
