import {CachedResult, SassPluginOptions} from './index'
import {OnLoadArgs, OnLoadResult} from 'esbuild'
import {promises as fsp, Stats} from 'fs'

type OnLoadCallback = (args: OnLoadArgs) => (OnLoadResult | null | undefined | Promise<OnLoadResult | null | undefined>)
type PluginLoadCallback = (path: string) => (OnLoadResult | null | undefined | Promise<OnLoadResult | null | undefined>)

function collectStats(watchFiles): Promise<Stats[]> {
  return Promise.all(watchFiles.map(filename => fsp.stat(filename)))
}

function maxMtimeMs(stats: Stats[]) {
  return stats.reduce((max, {mtimeMs}) => Math.max(max, mtimeMs), 0)
}

function getCache(options: SassPluginOptions): Map<string, CachedResult> | undefined {
  if (options.cache ?? true) {
    if (typeof options.cache === 'object') {
      return options.cache
    } else {
      return new Map()
    }
  }
}

export function useCache(options: SassPluginOptions = {}, loadCallback: PluginLoadCallback): OnLoadCallback {
  const cache = getCache(options)
  if (cache) {
    return async ({path}: OnLoadArgs) => {
      try {
        let cached = cache.get(path)
        if (cached) {
          let watchFiles = cached.result.watchFiles!
          let stats = await collectStats(watchFiles)
          for (const {mtimeMs} of stats) {
            if (mtimeMs > cached.mtimeMs) {
              cached.result = (await loadCallback(watchFiles[0]))!
              cached.mtimeMs = maxMtimeMs(stats)
              break
            }
          }
        } else {
          let result = await loadCallback(path)
          if (result) {
            cached = {
              mtimeMs: maxMtimeMs(await collectStats(result.watchFiles)),
              result
            }
            cache.set(path, cached)
          } else {
            return null;
          }
        }
        if (cached.result.errors) {
          cache.delete(path)
        }
        return cached.result
      } catch (error) {
        cache.delete(path)
        throw error
      }
    }
  } else {
    return ({path}) => loadCallback(path)
  }
}