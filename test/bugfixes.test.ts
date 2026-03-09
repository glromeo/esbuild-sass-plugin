import * as esbuild from 'esbuild'
import {existsSync} from 'fs'
import * as path from 'path'
import {postcssModules, sassPlugin} from '../src'

import {readJsonFile, readTextFile, useFixture, writeTextFile} from './test-toolkit'

describe('tests covering github issues', () => {

    let cwd
    beforeEach(() => {
        cwd = process.cwd()
    })
    afterEach(() => {
        process.chdir(cwd)
    })

    it('#18 Multiple files with the same name results in only one file being imported', async () => {

        await esbuild.build({
            entryPoints: ['./test/issues/18/entrypoint.js'],
            bundle: true,
            outdir: './test/issues/18/out',
            plugins: [sassPlugin({})]
        })

        const css = readTextFile('./test/issues/18/out/entrypoint.css')
        expect(css).containIgnoreSpaces('.component_a { background: blue; }')
        expect(css).containIgnoreSpaces('.component_b { background: yellow; }')
    })

    it('#20 Plugin stops working after a SASS failure', async () => {
        const options = useFixture('../issues/20')

        writeTextFile('dep.scss', `$primary-color: #333; body { padding: 0; color: $primary-color; }`)
        writeTextFile('tmp.scss', `@use 'dep'; body {background-color: dep.$primary-color }`)

        let step = 0

        const ctx = await esbuild.context({
            ...options,
            entryPoints: ['./tmp.scss'],
            outfile: './tmp.css',
            plugins: [sassPlugin(), {
                name: 'listener',
                setup({onEnd}) {
                    onEnd(({errors, warnings}) => {
                        const [failure] = errors
                        switch (step) {
                            case 0:
                                expect(failure).toBeUndefined()
                                writeTextFile('dep.scss', `$primary-color: #333; body { padding: 0 color: $primary-color; }`)
                                step++
                                return
                            case 1:
                                expect(failure.pluginName).toBe('sass-plugin')
                                writeTextFile('dep.scss', `$primary-color: #333; body { padding: 0; color: $primary-color; }`)
                                step++
                                return
                            case 2:
                                expect(failure).toBeUndefined()
                                writeTextFile('tmp.scss', `@use 'dep'; body {background-color: dep.$primary-color color: red }`)
                                step++
                                return
                            case 3:
                                expect(failure.pluginName).toBe('sass-plugin')
                                writeTextFile('tmp.scss', `@use 'dep'; body {background-color: dep.$primary-color; color: red }`)
                                step++
                                return
                            case 4:
                                expect(failure).toBeUndefined()
                                expect(warnings.length).toBe(0)
                                setTimeout(() => {
                                    ctx!.dispose()
                                }, 100)
                                step++
                                return
                        }
                    })
                }
            }],
            logLevel: 'silent'
        })

        await ctx.watch()
        await ctx.rebuild()

        await new Promise((resolve, reject) => {
            writeTextFile('tmp.scss', `@use 'dep'; body {background-color: dep.$primary-color; color: red }`)
            const interval = setInterval(() => {
                console.log('interval', step)
                if (step === 5) {
                    clearInterval(interval)
                    try {
                        expect(readTextFile('./tmp.css')).toMatch(/background-color: #333;/)
                        ctx.dispose()
                        resolve(null)
                    } catch (e) {
                        reject(e)
                    }
                }
            }, 250)
        })
    }, 10000)

    it('#21 Support for new math.div', async () => {
        const options = useFixture('../issues/21')

        let debug = jest.fn()
        let warn = jest.fn()

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

        expect(readTextFile('./out/sample.css')).toMatch(/z-index: 5;/)
        expect(debug).not.toHaveBeenCalled()
        expect(warn).not.toHaveBeenCalled()
    })

    it('#23 Support for previous methods of import in SASS', async () => {
        const options = useFixture('../issues/23')

        let debugCalls = 0
        let warnCalls = 0

        await esbuild.build({
            ...options,
            entryPoints: ['./index.js'],
            bundle: true,
            outdir: './out',
            plugins: [sassPlugin({
                type: 'style',
                quietDeps: true,
                logger: {
                    debug: () => {
                        debugCalls++
                    },
                    warn: () => {
                        warnCalls++
                    }
                }
            })]
        })

        expect(readTextFile('./out/index.js')).toMatch(/background-color: rgb\(174.3615973236, 100.8512807598, 255\);/)

        // NOTE: even with quietDeps: true we get 21 warnings!

        expect(debugCalls).toBe(0)
        expect(warnCalls).toBe(26)
    })

    it('#25 why require.resolve is set to cwd ?', async () => {
        const options = useFixture('../issues/25')

        const includePath = path.resolve(__dirname, 'fixture/node_modules')

        await esbuild.build({
            ...options,
            entryPoints: ['./index.js'],
            bundle: true,
            outdir: './out',
            plugins: [sassPlugin({
                loadPaths: [includePath]
            })]
        })

        expect(readTextFile('./out/index.css')).toMatch(/background-color: red;/)
    })

    it('#35 esbuild loader for woff2 being ignored', async () => {
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
                    type: 'css',
                    transform: postcssModules({}, [
                        postcssUrl({
                            basePath: '../../',
                            url: 'inline'
                        })
                    ])
                })
            ]
        })

        expect(readTextFile('./dist/FontA.css')).toMatch(/data:font\/woff2;base64/)
    })

    it('#61 npm exports and url encode/decode', async () => {
        const options = useFixture('../issues/61')

        let debugCalls = 0
        let warnCalls = 0

        await esbuild.build({
            ...options,
            entryPoints: ['./src/index.jsx'],
            outdir: './out',
            bundle: true,
            plugins: [sassPlugin({
                logger: {
                    debug: () => {
                        debugCalls++
                    },
                    warn: () => {
                        warnCalls++
                    }
                }
            })]
        })

        expect(existsSync('./out/index.js')).toBe(true)

        const css61 = readTextFile('./out/index.css')
        expect(css61).toContain('@charset "UTF-8"')
        expect(css61).toContain('/* src/快樂的.scss */')
        expect(css61).toContain('.\\5feb\\6a02\\7684')
        expect(css61).toContain('/* ../node_modules/swiper/swiper.scss */')

        expect(debugCalls).toBe(0)
        expect(warnCalls).toBe(3)
    })

    it('#69 when building scss files main scss file source is first in sourcemap not last', async () => {
        const options = useFixture('../issues/69')

        await esbuild.build({
            ...options,
            plugins: [
                sassPlugin({
                    loadPaths: ['scss_utils']
                })
            ],
            outdir: 'dist',
            entryPoints: [
                'src/with_use.scss',
                'src/without_use.scss'
            ],
            sourcemap: true,
            metafile: true
        })

        expect(readJsonFile('./dist/with_use.css.map')).toEqual({
            'version': 3,
            'sources': ['../src/with_use.scss', '../scss_utils/_colors.scss'],
            'sourcesContent': ['@use \'colors\';\n\na {\n  color: colors.$red;\n}', '$red: red;'],
            "mappings": "AAEA;AACE,SCHI;;",
            'names': []
        })
    })

    it('#74 Support for deprecated css imports (leftover css urls starting with ~)', async () => {
        const options = useFixture('../issues/74')

        await esbuild.build({
            ...options,
            entryPoints: ['./src/formio.scss'],
            bundle: true,
            outdir: './out',
            plugins: [sassPlugin({cssImports: true})]
        })

        expect(readTextFile('./out/formio.css'))
            .toMatch(/\/\* \.\.\/node_modules\/dialog-polyfill\/dist\/dialog-polyfill\.css \*\//)
    })

    it('#107 generate proper sourcesContent', async () => {
        const options = useFixture('../issues/107')

        await esbuild.build({
            ...options,
            plugins: [
                sassPlugin()
            ],
            outdir: 'dist',
            entryPoints: [
                'src/index.scss'
            ],
            sourcemap: true
        })

        let map = readJsonFile('./dist/index.css.map')
        map.sourcesContent[0] = map.sourcesContent[0].replace(/\r\n/g, '\n')

        expect(map).toEqual({
            'version': 3,
            'sources': ['../src/index.scss'],
            'sourcesContent': ['body {\n    background: black;\n}\n'],
            "mappings": "AAAA;AACI,cAAA;;",
            'names': []
        })
    })

    it('#166 Import of sass files without extension containing multiple dots (like common.mixins.scss)', async () => {
        const options = useFixture('../issues/166')

        await esbuild.build({
            ...options,
            entryPoints: ['./index.scss'],
            outdir: './out',
            bundle: true,
            plugins: [
                sassPlugin()
            ]
        })

        expect(readTextFile('out/index.css')).equalIgnoreSpaces(readTextFile('snapshot/index.css'))
    })
})
