import {OnLoadArgs, OnLoadResult, OnResolveArgs, Plugin} from "esbuild";
import {promises as fsp, readFileSync, Stats} from "fs";
import {dirname, resolve} from "path";
import picomatch from "picomatch";
import {CachedResult, SassPluginOptions, Type} from "./index";
import {loadSass, makeModule} from "./utils";
import {createSassImporter} from "./importer";

/**
 *
 * @param options
 */
export function sassPlugin(options: SassPluginOptions = {}): Plugin {

    if (!options.basedir) {
        options.basedir = process.cwd();
    }
    if (!options.picomatch) {
        options.picomatch = {unixify: true};
    }

    const sass = loadSass(options);

    const type: Type = typeof options.type === "string" ? options.type : "css";

    const matchers: [string, (args: OnResolveArgs) => boolean][] | false = Array.isArray(options.type)
        && options.type.map(function ([type, pattern]) {
            if (Array.isArray(pattern)) {
                const importerMatcher = picomatch("**/" + pattern[0], options.picomatch);
                const pathMatcher = pattern[1] ? picomatch("**/" + pattern[1], options.picomatch) : null;
                if (pathMatcher) {
                    return [
                        type, (args: OnResolveArgs) => importerMatcher(args.importer) && pathMatcher(resolve(args.resolveDir, args.path))
                    ];
                } else {
                    return [
                        type, (args: OnResolveArgs) => importerMatcher(args.importer)
                    ];
                }
            } else {
                if (pattern) {
                    const pathMatcher = picomatch("**/" + pattern, options.picomatch);
                    return [type, (args: OnResolveArgs) => pathMatcher(resolve(args.resolveDir, args.path))];
                } else {
                    return [type, () => true];
                }
            }
        });

    const typeOf = matchers
        ? (args: OnResolveArgs): Type => {
            for (const [type, isMatch] of matchers) if (isMatch(args)) {
                return type as Type;
            }
            return type;
        }
        : (): Type => type;

    function pathResolve({resolveDir, path, importer}: OnResolveArgs) {
        return resolve(resolveDir || dirname(importer), path);
    }

    function requireResolve({resolveDir, path, importer}: OnResolveArgs) {
        if (!resolveDir) {
            resolveDir = dirname(importer);
        }

        const mapper = options.mapper
        if(mapper) {
            path = mapper(path)
        }

        const paths = options.includePaths ? [resolveDir, ...options.includePaths] : [resolveDir];
        return require.resolve(path, {paths});
    }

    function readCssFileSync(path: string) {
        return {css: readFileSync(path, "utf-8"), watchFiles: [path]};
    }

    const importer = createSassImporter(options);

    function renderSync(file) {
        const {
            css,
            stats: {
                includedFiles
            }
        } = sass.renderSync({importer, ...options, file});
        return {
            css: css.toString("utf-8"),
            watchFiles: includedFiles
        };
    }

    const cache = !options.cache
        ? null
        : options.cache instanceof Map
            ? options.cache
            : new Map<string, Map<string, CachedResult>>();

    function collectStats(watchFiles): Promise<Stats[]> {
        return Promise.all(watchFiles.map(filename => fsp.stat(filename)));
    }

    function maxMtimeMs(stats: Stats[]) {
        return stats.reduce((max, {mtimeMs}) => Math.max(max, mtimeMs), 0);
    }

    function useExclude(callback) {
        const exclude = options.exclude;
        if (exclude) {
            return (args: OnResolveArgs) => exclude.test(args.path) ? null : callback(args)
        } else {
            return callback
        }
    }

    const RELATIVE_PATH = /^\.\.?\//;

    return {
        name: "sass-plugin",
        setup: function (build) {

            build.onResolve({filter: /\.(s[ac]ss|css)$/}, useExclude((args) => {
                if (RELATIVE_PATH.test(args.path)) {
                    return {path: pathResolve(args), namespace: "sass", pluginData: args};
                } else {
                    return {path: requireResolve(args), namespace: "sass", pluginData: args};
                }
            }));

            let cached: (
                transform: (filename: string, type: Type) => Promise<OnLoadResult>
            ) => (args) => Promise<OnLoadResult>;

            if (cache) {
                cached = (transform) => async ({path, pluginData: args}: OnLoadArgs) => {
                    let group = cache.get(args.resolveDir);
                    if (!group) {
                        group = new Map();
                        cache.set(args.resolveDir, group);
                    }
                    try {
                        let cached = group.get(args.path);
                        if (cached) {
                            let watchFiles = cached.result.watchFiles!;
                            let stats = await collectStats(watchFiles);
                            for (const {mtimeMs} of stats) {
                                if (mtimeMs > cached.mtimeMs) {
                                    cached.result = await transform(watchFiles[0], cached.type);
                                    cached.mtimeMs = maxMtimeMs(stats);
                                    break;
                                }
                            }
                            return cached.result;
                        }
                        let type = typeOf(args);
                        let result = await transform(path, type);
                        group.set(args.path, {
                            type,
                            mtimeMs: maxMtimeMs(await collectStats(result.watchFiles)),
                            result
                        });
                        return result;
                    } catch (error) {
                        group.delete(args.path);
                        throw error;
                    }
                };
            } else {
                cached = (transform) => ({path, pluginData: args}: OnLoadArgs) => {
                    return transform(path, typeOf(args));
                };
            }

            const lastWatchFiles = build.initialOptions.watch ? {} : null;

            async function transform(path: string, type: Type): Promise<OnLoadResult> {
                try {
                    let {css, watchFiles} = path.endsWith(".css") ? readCssFileSync(path) : renderSync(path);

                    watchFiles = [...watchFiles];
                    if (lastWatchFiles) {
                        lastWatchFiles[path] = watchFiles;
                    }

                    if (options.transform) {
                        const out: string | OnLoadResult = await options.transform(css, dirname(path), path);
                        if (typeof out !== "string") {
                            return {
                                contents: out.contents,
                                loader: out.loader,
                                resolveDir: dirname(path),
                                watchFiles
                            }
                        } else {
                            css = out;
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
                    };
                } catch (err) {
                    return {
                        errors: [{text: err.message}],
                        watchFiles: lastWatchFiles?.[path] ?? [path]
                    }
                }
            }

            build.onLoad({filter: /./, namespace: "sass"}, cached(transform));
        }
    };
}
