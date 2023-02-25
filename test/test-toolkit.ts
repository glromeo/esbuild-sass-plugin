import {BuildOptions} from 'esbuild'
import path from 'path'
import {mkdirSync, readFileSync, rmSync, writeFileSync} from 'fs'
import {sassPlugin, SassPluginOptions} from '../src'
import {fake} from 'mocha-toolkit'

export * from 'mocha-toolkit'

export function useFixture(name: string): BuildOptions {
  const absWorkingDir = path.resolve(__dirname, `fixture/${name}`)
  try {
    process.chdir(absWorkingDir)
  } catch (ignored) {
    mkdirSync(absWorkingDir, {recursive: true})
    process.chdir(absWorkingDir)
  }
  try {
    rmSync('out', {force: true, recursive: true})
  } catch (ignored) {
  }
  return {
    absWorkingDir // esbuild cwd is initialized when imported, we have to change it at each test case!
  }
}

export function deleteFixture(name: string) {
  const absWorkingDir = path.resolve(__dirname, `fixture/${name}`)
  try {
    rmSync(absWorkingDir, {force: true, recursive: true})
  } catch (ignored) {
  }
}

export function readTextFile(pathname: string) {
  return readFileSync(pathname, 'utf8')
}

export function readJsonFile(pathname: string) {
  return JSON.parse(readTextFile(pathname))
}

export function readCssFile(pathname: string) {
  return readTextFile(pathname).replace(/\/\* sass-plugin.+\*\//g, '/* no comment */')
}

export function writeTextFile(pathname: string, content: string) {
  writeFileSync(pathname, content)
}

export function pluginInternals(options: SassPluginOptions = {}) {
  const {setup} = sassPlugin(options)
  let resolveCallback, loadCallback, startCallback, endCallback, disposeCallback
  setup({
    esbuild: {} as any,
    initialOptions: {},
    onResolve(options, callback) {
      resolveCallback = callback
    },
    onLoad(options, callback) {
      loadCallback = callback
    },
    onStart(callback) {
      startCallback = callback
    },
    onEnd(callback) {
      endCallback = callback
    },
    onDispose(callback) {
      disposeCallback = callback
    },
    resolve: fake()
  })
  return {
    resolveCallback, loadCallback, startCallback, endCallback, disposeCallback
  }
}

// https://github.com/mozilla/source-map/issues/349

const nodeFetchDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'fetch')
Object.defineProperty(globalThis, 'fetch', {configurable: true, enumerable: true, value: undefined})

const {SourceMapConsumer} = require('source-map')

if (nodeFetchDescriptor) {
  Object.defineProperty(globalThis, 'fetch', nodeFetchDescriptor)
}

export function consumeSourceMap(sourceMap: any, callback) {
  return SourceMapConsumer.with(sourceMap, null, callback)
}