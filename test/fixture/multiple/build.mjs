import esbuild from 'esbuild'
import {sassPlugin, postcssModules} from '../../../lib/index.js'
import {fileURLToPath} from 'url'
import {dirname} from 'path'
import utils from '../utils.js'

const {cleanFixture, logFailure, logSuccess} = utils

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

cleanFixture(__dirname)

// plugins are matched in order so you have to put the most specific patterns (/\.module\.scss$/) first
// followed by the less specific (note that not having specified a filter the default is /\.(s[ac]ss|css)$/)

esbuild.build({
  entryPoints: ['src/main.js'],
  outdir: 'out',
  bundle: true,
  format: 'esm',
  plugins: [
    sassPlugin({
      filter: /\.module\.scss$/,
      transform: postcssModules({
        localsConvention: 'camelCaseOnly'
      }),
      type: 'css'
    }),
    sassPlugin({
      type: 'lit-css'
    })
  ]
}).then(logSuccess, logFailure)
