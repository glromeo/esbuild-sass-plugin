import * as esbuild from 'esbuild'
import {postcssModules, sassPlugin} from '../src'
import {readFileSync, statSync} from 'fs'
import {consumeSourceMap, readCssFile, readJsonFile, readTextFile, useFixture} from './test-toolkit'

describe('e2e tests', function () {

  this.timeout(5000)

  let cwd
  beforeEach(function () {
    cwd = process.cwd()
  })
  afterEach(function () {
    process.chdir(cwd)
  })

  function relativeToNodeModules(source: string): string {
    const start = source.indexOf('/node_modules')
    if (start > 0) {
      return '../..' + source.substring(start)
    } else {
      return source
    }
  }

  function parseSourceMap(filename: string): any {
    const cssText = readTextFile(filename)
    const start = cssText.indexOf('/*# sourceMappingURL=data:application/json;base64,')
    if (start > 0) {
      const begin = start + 50
      const end = cssText.indexOf(' */', begin)
      const encoded = cssText.slice(begin, end)
      return JSON.parse(Buffer.from(encoded, 'base64').toString())
    }
    return null
  }

  it('boostrap with sourcemaps', async function () {
    const options = useFixture('bootstrap')

    await esbuild.build({
      ...options,
      entryPoints: ['./src/index.js'],
      outdir: './out',
      bundle: true,
      sourcemap: 'both',
      plugins: [
        sassPlugin({
          quietDeps: true,
          prefer: 'sass',
          precompile(source, path, isRoot) {
            if (path.endsWith('_functions.scss')) {
              return source.replace('opacity($foreground) * 100)', 'opacity($foreground) * 100%)')
            } else {
              return source
            }
          }
        })
      ]
    })

    const sourceMap = readJsonFile('out/index.css.map')

    expect(parseSourceMap('./out/index.css')).to.deep.equal(sourceMap)

    sourceMap.sources = sourceMap.sources.map(relativeToNodeModules)

    const {sources} = JSON.parse(readFileSync('../node_modules/bootstrap/dist/css/bootstrap.css.map', 'utf8'))
    expect(sourceMap.sources.slice(0, -1).map(entry => entry.replace('../../node_modules/bootstrap/', '')))
      .to.include.members(sources.slice(1).map(entry => entry.replace('../../', '')))

    expect(sourceMap.sources).not.to.include.members([
      '../../node_modules/bootstrap/scss/_functions.scss'
    ])

    await consumeSourceMap(sourceMap, consumer => {
      expect(
        consumer.generatedPositionFor({
          source: '../../node_modules/bootstrap/scss/bootstrap.scss',
          line: 1,
          column: 0
        })
      ).to.eql({
        line: null, column: null, lastColumn: null
      })
      // :root {
      expect(
        consumer.generatedPositionFor({
          source: '../../node_modules/bootstrap/scss/_root.scss',
          line: 1,
          column: 0
        })
      ).to.eql({
        line: 4, column: 0, lastColumn: null
      })

      expect(
        consumer.originalPositionFor({line: 10286, column: 0})
      ).to.eql({
        source: `../src/entrypoint.scss`,
        line: 3,
        column: 0,
        name: null
      })
    })
  })

  it('react with css loader', async function () {
    const options = useFixture('react')

    await esbuild.build({
      ...options,
      entryPoints: ['./src/index.tsx'],
      outdir: './out',
      bundle: true,
      define: {'process.env.NODE_ENV': '"development"'},
      plugins: [
        sassPlugin()
      ]
    })

    let cssBundle = readTextFile('./out/index.css')

    expect(cssBundle, 'contribute from antd').to.containIgnoreSpaces(
      '@-ms-viewport { width: device-width; }'
    )
    expect(cssBundle, 'contribute from App.scss').to.containIgnoreSpaces(
      '.App .header {\n' +
      '  color: blue;\n' +
      '  border: 1px solid aliceblue;\n' +
      '  padding: 4px;\n' +
      '}'
    )
    expect(cssBundle, 'contribute from index.css').to.containIgnoreSpaces(
      'code {\n' +
      '  font-family:\n' +
      '    source-code-pro,\n' +
      '    Menlo,\n' +
      '    Monaco,\n' +
      '    Consolas,\n' +
      '    "Courier New",\n' +
      '    monospace;\n' +
      '}'
    )

  })

  it('lit-element component (mix of dynamic style and imported css result)', async function () {
    const options = useFixture('lit-element')

    await esbuild.build({
      ...options,
      entryPoints: ['./src/index.ts'],
      outdir: './out',
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
    })

    const bundle = readTextFile('./out/index.js')

    expect(bundle).to.containIgnoreSpaces(`
      var i = (t3, ...e7) => {
        const n6 = 1 === t3.length ? t3[0] : e7.reduce((e8, s5, n7) => e8 + ((t4) => {
          if (true === t4._$cssResult$)
            return t4.cssText;
          if ("number" == typeof t4)
            return t4;
          throw Error("Value passed to 'css' function must be a 'css' function result: " + t4 + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
        })(s5) + t3[n7 + 1], t3[0]);
        return new o(n6, t3, s);
      };
    `)

    expect(bundle).to.have.string('var hello_world_default = i`' +
      '.banner {\n' +
      '  font-family: sans-serif;\n' +
      '  color: blue;\n' +
      '  background: black;\n' +
      '  border: 5px solid blue;\n' +
      '  padding: 20px;\n' +
      '}`;\n')

    expect(bundle).to.have.string(
      `document.head.appendChild(document.createElement("style")).appendChild(document.createTextNode(css));`
    )

    expect(bundle).to.have.string('var css = `.container {\n' +
      '  display: flex;\n' +
      '  flex-direction: column;\n' +
      '}\n' +
      '\n' +
      '.banner {\n' +
      '  font-family: sans-serif;\n' +
      '  border: 5px solid red;\n' +
      '  padding: 20px;\n' +
      '  background: black;\n' +
      '  color: red;\n' +
      '}`;')
  })

  it('post-css', async function () {
    const options = useFixture('post-css')

    const resolveOptions = {paths: [options.absWorkingDir!]}
    const postcss = require(require.resolve('postcss', resolveOptions))
    const autoprefixer = require(require.resolve('autoprefixer', resolveOptions))
    const postcssPresetEnv = require(require.resolve('postcss-preset-env', resolveOptions))

    const postCSS = postcss([autoprefixer, postcssPresetEnv({stage: 0})])

    await esbuild.build({
      ...options,
      entryPoints: ['src/app.css'],
      outdir: 'out',
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
    })

    // NOTE: You might want to update these snapshots when you upgrade postcss!

    let expected = readCssFile('./snapshot/app.css')
    expected = expected.replace(/url\("img\/background(-2x)?.jpg"\)/g, 'url()')

    let actual = readCssFile('./out/app.css')
    actual = actual.slice(actual.indexOf('\n') + 1).replace(/url\(data:image\/jpeg,\)/g, 'url()')

    expect(actual.replace(/;/g, '')).to.equalIgnoreSpaces(expected.replace(/;/g, ''))
  })

  it('css modules', async function () {
    const options = useFixture('css-modules')

    await esbuild.build({
      ...options,
      entryPoints: ['./src/index.js'],
      outdir: './out',
      bundle: true,
      format: 'esm',
      plugins: [
        sassPlugin({
          transform: postcssModules({
            localsConvention: 'camelCaseOnly'
          })
        })
      ]
    });

    const bundle = readTextFile('./out/index.js')

    expect(bundle).to.containIgnoreSpaces('class="${example_module_default.message} ${common_module_default.message}"')

    expect(bundle).to.containIgnoreSpaces(`
      var common_module_default = {
        "message": "_message_bxgcs_1"
      };
    `)

    expect(bundle).to.containIgnoreSpaces(`
      var example_module_default = {
        "message": "_message_1vmzm_1"
      };
    `)
  })

  it('named exports', async function () {
    const options = useFixture('named-exports')

    await esbuild.build({
      ...options,
      entryPoints: ['./src/index.js'],
      outdir: './out',
      bundle: true,
      format: 'esm',
      plugins: [
        sassPlugin({
          transform: postcssModules({
            localsConvention: 'camelCaseOnly'
          }),
          namedExports: (name) => {
            return `${name.replace(/-/g, "_")}`;
          },
        })
      ]
    });

    const bundle = readTextFile('./out/index.js')

    expect(bundle).to.containIgnoreSpaces('class="${message} ${message2}')

    expect(bundle).to.containIgnoreSpaces(`var message = "_message_1vmzm_1"`)

    expect(bundle).to.containIgnoreSpaces(`var message2 = "_message_bxgcs_1";`)
  })

  it('css modules & lit-element together', async function () {
    const options = useFixture('multiple')

    await esbuild.build({
      ...options,
      entryPoints: ['./src/main.js'],
      outdir: './out',
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
    })

    const main = readTextFile('./out/main.js')

    expect(main).to.containIgnoreSpaces(
      `class="$\{example_module_default.message} $\{common_module_default.message}"`
    )

    expect(main).to.containIgnoreSpaces(`
      var common_module_default = {
        "message": "_message_bxgcs_1"
      };
    `)
    expect(main).to.containIgnoreSpaces(`
      var example_module_default = {
        "message": "_message_kto8s_1"
      };
    `)

    expect(main).to.containIgnoreSpaces(`
      // src/lit/styles.scss
      var styles_default = i\`
      .message {
        font-family: sans-serif;
        color: white;
        background-color: red;
        border: 2px solid darkred;
        padding: 8px;
      }\`;
    `)
  })

  it('local-css', async function () {
    const options = useFixture('local-css')

    await esbuild.build({
      ...options,
      entryPoints: ['./src/index.js'],
      outdir: './out',
      bundle: true,
      format: 'esm',
      plugins: [
        sassPlugin({
          type: 'local-css'
        }),
      ]
    })

    const bundle = readTextFile('./out/index.js')

    expect(bundle).to.containIgnoreSpaces('class="${message} ${message2}"')

    expect(bundle).to.containIgnoreSpaces(`
      var message = "example_module_message";
    `)

    expect(bundle).to.containIgnoreSpaces(`
      var message2 = "common_module_message";
    `)
  })

  it('open-iconic (dealing with relative paths & data urls)', async function () {
    const options = useFixture('open-iconic')

    let styleSCSS = readTextFile('./src/styles.scss')
    expect(styleSCSS).to.have.string(
      '$iconic-font-path: \'open-iconic/font/fonts/\';'
    )

    await esbuild.build({
      ...options,
      entryPoints: ['./src/styles.scss'],
      outdir: './out',
      bundle: true,
      format: 'esm',
      loader: {
        '.eot': 'file',
        '.woff': 'file',
        '.ttf': 'file',
        '.svg': 'file',
        '.otf': 'file'
      },
      plugins: [sassPlugin()]
    })

    const outCSS = readTextFile('./out/styles.css')
    expect(outCSS).to.match(/url\("\.\/open-iconic-[^.]+\.eot\?#iconic-sm"\) format\("embedded-opentype"\)/)

    await esbuild.build({
      ...options,
      entryPoints: ['./src/index.ts'],
      outfile: './out/bundle.js',
      bundle: true,
      format: 'esm',
      loader: {
        '.eot': 'dataurl',
        '.woff': 'dataurl',
        '.ttf': 'dataurl',
        '.svg': 'dataurl',
        '.otf': 'dataurl'
      },
      plugins: [sassPlugin()]
    })

    const outFile = readTextFile('./out/bundle.css')
    expect(outFile).to.have.string(
      'src: url(data:application/vnd.ms-fontobject;base64,JG4AAHxt'
    )

    await esbuild.build({
      ...options,
      entryPoints: ['./src/index.ts'],
      outdir: './out',
      bundle: true,
      format: 'esm',
      plugins: [sassPlugin({
        type: 'lit-css',
        async transform(css, resolveDir) {
          const {outputFiles: [out]} = await esbuild.build({
            stdin: {
              contents: css,
              resolveDir,
              loader: 'css'
            },
            bundle: true,
            write: false,
            format: 'esm',
            loader: {
              '.eot': 'dataurl',
              '.woff': 'dataurl',
              '.ttf': 'dataurl',
              '.svg': 'dataurl',
              '.otf': 'dataurl'
            }
          })
          return out.text
        }
      })]
    })

    const outJS = readTextFile('./out/index.js')
    expect(outJS).to.have.string(
      'src: url(data:application/vnd.ms-fontobject;base64,JG4AAHxt'
    )

  })

  it('watched files', async function () {
    const options = useFixture('watch')

    require('./fixture/watch/initial')

    let count = 0

    const ctx = await esbuild.context({
      ...options,
      entryPoints: ['./src/index.js'],
      outdir: './out',
      bundle: true,
      plugins: [
        sassPlugin({type: 'css-text'}),
        {
          name: 'counter',
          setup(build) {
            build.onStart(() => {
              count++
            })
          }
        }
      ]
    })

    await ctx.watch()
    await ctx.rebuild()

    expect(readTextFile('./out/index.js')).to.match(/crimson/)

    let {mtimeMs} = statSync('./out/index.js')
    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(reject, 10000)
      setTimeout(function tryAgain() {
        if (mtimeMs < statSync('./out/index.js').mtimeMs) {
          clearTimeout(timeout)
          resolve()
        } else {
          setTimeout(tryAgain, 1000)
        }
      }, 1000)
      require('./fixture/watch/update')
    })

    expect(readTextFile('./out/index.js')).to.match(/cornflowerblue/)

    expect(count).to.eq(2)

    await ctx.dispose()
  })

  it('precompile allows to add additional data', async function () {
    const options = useFixture('precompile')

    const env = readTextFile('./env.scss')

    const context = {blue: 'blue'}

    await esbuild.build({
      ...options,
      entryPoints: ['./index.js'],
      outdir: './out',
      bundle: true,
      plugins: [sassPlugin({
        precompile(source, pathname) {
          const prefix = /included\.scss$/.test(pathname) ? `
            $color: ${context.blue};
          ` : env
          return prefix + source
        }
      })]
    })

    const bundle = readTextFile('./out/index.css')

    expect(bundle).to.containIgnoreSpaces(`
      .included {
        color: blue;
      }
    `)
    expect(bundle).to.containIgnoreSpaces(`
      .excluded {
        color: red;
      }
    `)
  })

  it('precompile respects sourcemaps', async function () {
    console.warn('NOT IMPLEMENTED YET')
  })
})
