import {OnLoadResult, Plugin} from 'esbuild'
import {dirname, resolve} from 'path'
import {SassPluginOptions} from './index'
import {getContext, makeModule, modulesPaths, RELATIVE_PATH} from './utils'
import {useCache} from './cache'
import {createRenderer} from './render'

const DEFAULT_FILTER = /\.(s[ac]ss|css)$/

/**
 *
 * @param options
 */
export function sassPlugin(options: SassPluginOptions = {}): Plugin {

  if (!options.basedir) {
    options.basedir = process.cwd()
  }

  if (options.includePaths) {
    console.log(`'includePaths' option is deprecated, please use 'loadPaths' instead`)
  }
  options.loadPaths = Array.from(new Set([
    ...options.loadPaths || modulesPaths(),
    ...options.includePaths || []
  ]))

  const type = options.type ?? 'css'

  if (options['picomatch'] || options['exclude'] || typeof type !== 'string') {
    console.log('The type array, exclude and picomatch options are no longer supported, please refer to the README for alternatives.')
  }

  const requireOptions = {paths: ['.', ...options.loadPaths]}

  function resolvePath(basedir: string, path: string) {
    if (options.importMapper) {
      path = options.importMapper(path)
    }
    if (RELATIVE_PATH.test(path)) {
      return resolve(basedir, path)
    } else {
      requireOptions.paths[0] = basedir
      return require.resolve(path, requireOptions)
    }
  }

  return {
    name: 'sass-plugin',
    setup({initialOptions, onLoad}) {

      const {
        sourcemap,
        watched
      } = getContext(initialOptions)

      const renderSass = createRenderer(options, options.sourceMap ?? sourcemap)
      const transform = options.transform

      onLoad({filter: options.filter ?? DEFAULT_FILTER}, useCache(options, async path => {
        try {
          let {cssText, watchFiles} = await renderSass(path)

          if (watched) {
            watched[path] = watchFiles
          }

          const resolveDir = dirname(path)

          if (transform) {
            const out: string | OnLoadResult = await transform(cssText, resolveDir, path)
            if (typeof out !== 'string') {
              return {
                contents: out.contents,
                loader: out.loader,
                resolveDir,
                watchFiles: [...watchFiles, ...(out.watchFiles || [])],
                watchDirs: out.watchDirs || []
              }
            } else {
              cssText = out
            }
          }

          return type === 'css' ? {
            contents: cssText,
            loader: 'css',
            resolveDir,
            watchFiles
          } : {
            contents: makeModule(cssText, type),
            loader: 'js',
            resolveDir,
            watchFiles
          }

        } catch (err: any) {
          return {
            errors: [{text: err.message}],
            watchFiles: watched?.[path] ?? [path]
          }
        }
      }))
    }
  }
}
