import {OnLoadResult, Plugin} from 'esbuild'
import {dirname} from 'path'
import {SassPluginOptions, TransformContext} from './index'
import {getContext, makeModule, modulesPaths, parseNonce} from './utils'
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

  const type = options.type ?? 'css'
  const nonce = parseNonce(options.nonce)
  const shouldExclude = options.exclude ? options.exclude.test.bind(options.exclude) : () => false

  const transformContext:TransformContext = {
    ...options,
    type,
    chunks: {}
  };

  return {
    name: 'sass-plugin',
    setup({initialOptions, onResolve, onLoad, resolve}) {

      options.loadPaths = Array.from(new Set([
        ...options.loadPaths || modulesPaths(initialOptions.absWorkingDir),
        ...options.includePaths || []
      ]))

      const {
        sourcemap,
        watched
      } = getContext(initialOptions)

      if (options.external) {
        onResolve({filter: options.external}, args => {
          return {path: args.path, external: true}
        })
      }

      if (options.cssImports) {
        onResolve({filter: /^~.*\.css$/}, ({path, importer, resolveDir}) => {
          if (shouldExclude(path)) {
            return null;
          } else {
            return resolve(path.slice(1), {importer, resolveDir, kind: 'import-rule'})
          }
        })
      }

      const transform = options.transform ? options.transform.bind(transformContext) : null

      if (transform) {

      }

      const renderSync = createRenderer(options, options.sourceMap ?? sourcemap)

      onLoad({filter: options.filter ?? DEFAULT_FILTER}, useCache(options, async path => {
        if (shouldExclude(path)) {
          return null;
        } else try {
          let {cssText, watchFiles} = renderSync(path)

          watched[path] = watchFiles

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
            contents: makeModule(cssText, type, nonce),
            loader: 'js',
            resolveDir,
            watchFiles
          }

        } catch (err: any) {
          return {
            errors: [{text: err.message}],
            watchFiles: watched[path] ?? [path]
          }
        }
      }))
    }
  }
}
