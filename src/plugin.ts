import {OnLoadArgs, OnLoadResult, OnResolveArgs, Plugin} from "esbuild"
import * as fs from "fs"
import {promises as fsp, readFileSync, Stats} from "fs"
import {dirname, extname, resolve, sep} from "path"
import picomatch from "picomatch"
import {CachedResult, SassPluginOptions, Type} from "./index"
import {makeModule} from "./utils"
import * as sass from "sass"
import {ImporterResult} from "sass"
import {pathToFileURL} from "url"

let pluginIndex: number = 0

/**
 *
 * @param options
 */
export function sassPlugin(options: SassPluginOptions = {}): Plugin {

  if (!options.basedir) {
    options.basedir = process.cwd()
  }
  if (!options.picomatch) {
    options.picomatch = {unixify: true}
  }

  const type: Type = typeof options.type === "string" ? options.type : "css"

  const matchers: [string, (args: OnResolveArgs) => boolean][] | false = Array.isArray(options.type)
    && options.type.map(function ([type, pattern]) {
      if (Array.isArray(pattern)) {
        const importerMatcher = picomatch("**/" + pattern[0], options.picomatch)
        const pathMatcher = pattern[1] ? picomatch("**/" + pattern[1], options.picomatch) : null
        if (pathMatcher) {
          return [
            type, (args: OnResolveArgs) => importerMatcher(args.importer) && pathMatcher(resolve(args.resolveDir, args.path))
          ]
        } else {
          return [
            type, (args: OnResolveArgs) => importerMatcher(args.importer)
          ]
        }
      } else {
        if (pattern) {
          const pathMatcher = picomatch("**/" + pattern, options.picomatch)
          return [type, (args: OnResolveArgs) => pathMatcher(resolve(args.resolveDir, args.path))]
        } else {
          return [type, () => true]
        }
      }
    })

  const typeOf = matchers
    ? (args: OnResolveArgs): Type => {
      for (const [type, isMatch] of matchers) if (isMatch(args)) {
        return type as Type
      }
      return type
    }
    : (): Type => type

  function pathResolve({resolveDir, path, importer}: OnResolveArgs) {
    return resolve(resolveDir || dirname(importer), path)
  }

  function requireResolve({resolveDir, path, importer}: OnResolveArgs) {
    if (!resolveDir) {
      resolveDir = dirname(importer)
    }

    const mapper = options.importMapper
    if (mapper) {
      path = mapper(path)
    }

    const paths = options.includePaths ? [resolveDir, ...options.includePaths] : [resolveDir]
    return require.resolve(path, {paths})
  }

  function readCssFileSync(path: string) {
    return {css: readFileSync(path, "utf-8"), watchFiles: [path]}
  }

  /**
   * NOTE: we're deliberately ignoring sass recommendation to avoid sacrificing speed here!
   * - we prefer fragment attempt over syntax attempt
   * - we prefer .scss over .sass
   * - we don't throw exceptions if the URL is ambiguous
   */
  function resolveSassImport(pathname: string, ext?: string): string | null {
    if (ext) {
      let filename = pathname + ext
      if (fs.existsSync(filename)) {
        return filename
      }
      const index = filename.lastIndexOf(sep)
      filename = index >= 0 ? filename.slice(0, index) + sep + "_" + filename.slice(index + 1) : "_" + filename
      if (fs.existsSync(filename)) {
        return filename
      }
      return null
    } else {
      return resolveSassImport(pathname, ".scss")
        || resolveSassImport(pathname, ".sass")
        || resolveSassImport(pathname + sep + "index")
    }
  }

  function renderSync(path) {
    const basedir = dirname(path)
    let source = fs.readFileSync(path, "utf8")
    if (options.precompile) {
      source = options.precompile(source)
    }
    const {
      css,
      loadedUrls
    } = sass.compileString(source, {
      importer: {
        load(canonicalUrl: URL): ImporterResult | null {
          const filename = canonicalUrl.pathname.slice(1)
          const contents = fs.readFileSync(filename, "utf8")
          switch (extname(filename)) {
            case ".scss":
              return {contents, syntax: "scss"}
            case ".css":
              return {contents, syntax: "css"}
            default:
              return {contents, syntax: "indented"}
          }
        },
        canonicalize(url: string): URL | null {
          let filename
          if (url.startsWith("~")) {
            filename = require.resolve(url.slice(1), {paths: [basedir]})
          } else if (url.startsWith("file://")) {
            filename = url.slice(8)
          } else {
            filename = url
          }
          if (options.importMapper) {
            filename = options.importMapper(filename)
          }
          filename = resolve(basedir, filename)
          let ext = filename.lastIndexOf(".")
          if (ext >= 0) {
            filename = resolveSassImport(filename.slice(0, ext), filename.slice(ext))
          } else {
            filename = resolveSassImport(filename)
          }
          if (filename) {
            return pathToFileURL(filename)
          } else {
            return null
          }
        }
      },
      logger: {
        warn(message, options) {
          console.log(message, options)
        },
        debug(message, options) {
          console.log(message, options)
        }
      }
    })
    return {
      css: css.toString(),
      watchFiles: loadedUrls.map(url => url.pathname.slice(1))
    }
  }

  const cache = !options.cache
    ? null
    : options.cache instanceof Map
      ? options.cache
      : new Map<string, Map<string, CachedResult>>()

  function collectStats(watchFiles): Promise<Stats[]> {
    return Promise.all(watchFiles.map(filename => fsp.stat(filename)))
  }

  function maxMtimeMs(stats: Stats[]) {
    return stats.reduce((max, {mtimeMs}) => Math.max(max, mtimeMs), 0)
  }

  function useExclude(callback) {
    const exclude = options.exclude
    if (exclude instanceof RegExp) {
      return (args: OnResolveArgs) => exclude.test(args.path) ? null : callback(args)
    } else if (typeof exclude === "function") {
      return (args: OnResolveArgs) => exclude(args) ? null : callback(args)
    } else if (typeof exclude === "object") {
      throw new Error("invalid exclude option")
    } else {
      return callback
    }
  }

  const RELATIVE_PATH = /^\.\.?\//

  const namespace = `sass-plugin-${pluginIndex++}`

  return {
    name: "sass-plugin",
    setup: function (build) {

      build.onResolve({filter: /\.(s[ac]ss|css)$/}, useExclude((args) => {
        if (RELATIVE_PATH.test(args.path)) {
          return {path: pathResolve(args), namespace, pluginData: args}
        } else {
          return {path: requireResolve(args), namespace, pluginData: args}
        }
      }))

      let cached: (
        transform: (filename: string, type: Type) => Promise<OnLoadResult>
      ) => (args) => Promise<OnLoadResult>

      if (cache) {
        cached = (transform) => async ({path, pluginData: args}: OnLoadArgs) => {
          let group = cache.get(args.resolveDir)
          if (!group) {
            group = new Map()
            cache.set(args.resolveDir, group)
          }
          try {
            let cached = group.get(args.path)
            if (cached) {
              let watchFiles = cached.result.watchFiles!
              let stats = await collectStats(watchFiles)
              for (const {mtimeMs} of stats) {
                if (mtimeMs > cached.mtimeMs) {
                  cached.result = await transform(watchFiles[0], cached.type)
                  cached.mtimeMs = maxMtimeMs(stats)
                  break
                }
              }
              return cached.result
            }
            let type = typeOf(args)
            let result = await transform(path, type)
            group.set(args.path, {
              type,
              mtimeMs: maxMtimeMs(await collectStats(result.watchFiles)),
              result
            })
            return result
          } catch (error) {
            group.delete(args.path)
            throw error
          }
        }
      } else {
        cached = (transform) => ({path, pluginData: args}: OnLoadArgs) => {
          return transform(path, typeOf(args))
        }
      }

      const lastWatchFiles = build.initialOptions.watch ? {} : null

      async function transform(path: string, type: Type): Promise<OnLoadResult> {
        try {
          let {css, watchFiles} = path.endsWith(".css") ? readCssFileSync(path) : renderSync(path)

          watchFiles = [...watchFiles]
          if (lastWatchFiles) {
            lastWatchFiles[path] = watchFiles
          }

          if (options.transform) {
            const out: string | OnLoadResult = await options.transform(css, dirname(path), path)
            if (typeof out !== "string") {
              return {
                contents: out.contents,
                loader: out.loader,
                resolveDir: dirname(path),
                watchFiles: [...watchFiles, ...(out.watchFiles || [])],
                watchDirs: out.watchDirs || []
              }
            } else {
              css = out
            }
          }

          return type === "css" ? {
            contents: css,
            loader: "css",
            resolveDir: dirname(path),
            watchFiles
          } : {
            contents: makeModule(css, type),
            loader: "js",
            resolveDir: dirname(path),
            watchFiles
          }
        } catch (err: any) {
          return {
            errors: [{text: err.message}],
            watchFiles: lastWatchFiles?.[path] ?? [path]
          }
        }
      }

      build.onLoad({filter: /./, namespace}, cached(transform))
    }
  }
}
