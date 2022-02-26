import {expect} from 'chai'
import * as esbuild from 'esbuild'
import * as path from 'path'
import {postcssModules, sassPlugin} from '../src'

import {readJsonFile, readTextFile, sinon, useFixture, writeTextFile} from "./test-toolkit";
import {existsSync} from 'fs'

describe('tests covering github issues', function () {

  let cwd
  beforeEach(function () {
    cwd = process.cwd()
  })
  afterEach(function () {
    process.chdir(cwd)
  })

  it('#18 Multiple files with the same name results in only one file being imported', async function () {

    await esbuild.build({
      entryPoints: ['./test/issues/18/entrypoint.js'],
      bundle: true,
      outdir: './test/issues/18/out',
      plugins: [sassPlugin({})]
    })

    expect(readTextFile('./test/issues/18/out/entrypoint.css'))
      .to.containIgnoreSpaces('.component_a { background: blue; }')
      .and.containIgnoreSpaces('.component_b { background: yellow; }')
  })

  it('#20 Plugin stops working after a SASS failure', async function () {
    const options = useFixture('../issues/20')

    writeTextFile('dep.scss', `$primary-color: #333; body { padding: 0; color: $primary-color; }`)
    writeTextFile('tmp.scss', `@use 'dep'; body {background-color: dep.$primary-color }`)

    let step = 0

    const result = await esbuild.build({
      ...options,
      entryPoints: ['./tmp.scss'],
      outfile: './tmp.css',
      plugins: [sassPlugin()],
      logLevel: 'silent',
      watch: {
        onRebuild(failure, result) {
          switch (step) {
            case 0:
              expect(failure).to.be.null
              writeTextFile('dep.scss', `$primary-color: #333; body { padding: 0 color: $primary-color; }`)
              return step++
            case 1:
              expect(failure).to.be.not.null
              writeTextFile('dep.scss', `$primary-color: #333; body { padding: 0; color: $primary-color; }`)
              return step++
            case 2:
              expect(failure).to.be.null
              writeTextFile('tmp.scss', `@use 'dep'; body {background-color: dep.$primary-color color: red }`)
              return step++
            case 3:
              expect(failure).to.be.not.null
              writeTextFile('tmp.scss', `@use 'dep'; body {background-color: dep.$primary-color; color: red }`)
              return step++
            case 4:
              expect(failure).to.be.null
              expect(result).to.be.not.null
              result!.stop!()
              return step++
          }
        }
      }
    })

    await new Promise((resolve, reject) => {
      writeTextFile('tmp.scss', `@use 'dep'; body {background-color: dep.$primary-color; color: red }`)
      const interval = setInterval(() => {
        if (step === 5) {
          clearInterval(interval)
          try {
            expect(readTextFile('./tmp.css')).to.match(/background-color: #333;/)
            result.stop!()
            resolve(null)
          } catch (e) {
            reject(e)
          }
        }
      }, 250)
    })
  })

  it('#21 Support for new math.div', async function () {
    const options = useFixture('../issues/21')

    let debug = sinon.fake()
    let warn = sinon.fake()

    await esbuild.build({
      ...options,
      entryPoints: ['./index.scss'],
      outfile: './out/sample.css',
      plugins: [sassPlugin({
        logger: {
          debug,
          warn
        }
      })]
    })

    expect(readTextFile('./out/sample.css')).to.match(/z-index: 5;/)
    expect(debug).to.be.callCount(0)
    expect(warn).to.be.callCount(0)
  })

  it('#23 Support for previous methods of import in SASS', async function () {
    const options = useFixture('../issues/23')

    let debug = sinon.fake()
    let warn = sinon.fake()

    await esbuild.build({
      ...options,
      entryPoints: ['./index.js'],
      bundle: true,
      outdir: './out',
      plugins: [sassPlugin({
        type: 'style',
        quietDeps: true,
        logger: {
          debug,
          warn
        }
      })]
    })

    expect(readTextFile('./out/index.js')).to.match(/background-color: #ae65ff;/)

    // NOTE: even with quietDeps: true we get 7 warnings!

    expect(debug).to.be.callCount(0)
    expect(warn).to.be.callCount(7)
  })

  it('#25 why require.resolve is set to cwd ?', async function () {
    const options = useFixture('../issues/25')

    const includePath = path.resolve(__dirname, 'fixture/node_modules')

    await esbuild.build({
      ...options,
      entryPoints: ['./index.js'],
      bundle: true,
      outdir: './out',
      plugins: [sassPlugin({
        includePaths: [includePath]
      })]
    })

    expect(readTextFile('./out/index.css')).to.match(/background-color: red;/)
  })

  it('#35 esbuild loader for woff2 being ignored', async function () {
    const options = useFixture('../issues/35/packages/fonta')

    const postcssUrl = require('postcss-url')

    await esbuild.build({
      ...options,
      entryPoints: ['./src/FontA.tsx'],
      bundle: true,
      sourcemap: true,
      minify: true,
      splitting: true,
      format: 'esm',
      target: ['esnext'],
      outdir: './dist/',
      loader: {
        '.woff': 'dataurl',
        '.woff2': 'dataurl'
      },
      plugins: [
        sassPlugin({
          type: 'css-text',
          transform: postcssModules({}, [
            postcssUrl({
              basePath: '../../',
              url: 'inline'
            })
          ])
        })
      ]
    })

    expect(readTextFile('./dist/FontA.js')).match(/data:font\/woff2;base64/)
  })

  it('#61 npm exports and url encode/decode', async function () {
    const options = useFixture('../issues/61')

    let debug = sinon.fake()
    let warn = sinon.fake()

    await esbuild.build({
      ...options,
      entryPoints: ['./src/index.jsx'],
      outdir: './out',
      bundle: true,
      plugins: [sassPlugin({
        logger: {
          debug,
          warn
        }
      })]
    })

    expect(existsSync('./out/index.js')).to.be.true

    expect(readTextFile('./out/index.css'))
      .to.include('@charset "UTF-8"', 'has the correct encoding')
      .and.include('/* src/快樂的.scss */', 'sass has imported a file with chinese in the name')
      .and.include('.\\5feb\\6a02\\7684', 'chinese css classes are unicode escaped (tested in Chrome)')
      .and.include('/* ../node_modules/swiper/swiper.scss */', 'has imported swiper/scss')

    expect(debug).to.be.callCount(0)
    expect(warn).to.be.callCount(0)
  })

  it('#69 when building scss files main scss file source is first in sourcemap not last', async function () {
    const options = useFixture('../issues/69')

    await esbuild.build({
      ...options,
      plugins: [
        sassPlugin({
          loadPaths: [ 'scss_utils', ],
        }),
      ],
      outdir: 'dist',
      entryPoints: [
        'src/with_use.scss',
        'src/without_use.scss',
      ],
      sourcemap: true,
      metafile: true,
    })

    expect(readJsonFile('./dist/with_use.css.map')).to.eql({
      "version": 3,
      "sources": ["../src/with_use.scss", "../scss_utils/_colors.scss"],
      "sourcesContent": [null, null],
      "mappings": "AAEA;AACE;;",
      "names": []
    })
  })

  it('#74 Support for deprecated css imports (leftover css urls starting with ~)', async function () {
    const options = useFixture('../issues/74')

    await esbuild.build({
      ...options,
      entryPoints: ["./src/formio.scss"],
      bundle: true,
      outdir: "./out",
      plugins: [sassPlugin({cssImports: true})]
    })

    expect(readTextFile('./out/formio.css'))
        .to.match(/\/\* \.\.\/node_modules\/dialog-polyfill\/dist\/dialog-polyfill\.css \*\//)
  })
})
