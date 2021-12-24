const esbuild = require('esbuild')
const {sassPlugin} = require('../../../lib')
const {readFileSync} = require('fs')

const env = readFileSync('./env.scss', 'utf-8')

const context = {color: 'blue'}

esbuild.build({
  entryPoints: ['index.js'],
  outdir: './out',
  bundle: true,
  plugins: [
    sassPlugin({
      precompile(source, pathname) {
        const prefix = /\/included\.scss$/.test(pathname) ? `
            $color: ${context.color};
          ` : env
        return prefix + source
      }
    })
  ]
}).then(() => {
  console.log('OK')
}).catch(console.error)
