import {Loader, OnLoadArgs, OnLoadResult, OnResolveArgs, Plugin} from "esbuild";
import {readFileSync, statSync} from "fs";
import path, {dirname, resolve} from "path";
import picomatch from "picomatch";
import * as sass from "sass";

export type SassPluginOptions = sass.Options & {
    basedir?: string
    type?: string | ([string] | [string, string | [string] | [string, string]])[]
    cache?: boolean
    picomatch?: any
}

type CachedResult = {
    filename: string
    type: string
    mtimeMs: number
    result: OnLoadResult
};

const cssResultModule = cssText => `\
import {css} from "lit-element";
export default css\`
${cssText.replace(/([$`\\])/g, "\\$1")}\`;
`;

const styleModule = cssText => `\
document.head
    .appendChild(document.createElement("style"))
    .appendChild(document.createTextNode(\`
${cssText.replace(/([$`\\])/g, "\\$1")}\`));
`;

function makeModule(contents: string, type: string) {
    return type === "style" ? styleModule(contents) : cssResultModule(contents);
}

export function sassPlugin(options: SassPluginOptions = {}): Plugin {

    if (!options.basedir) {
        options.basedir = process.cwd();
    }
    if (!options.picomatch) {
        options.picomatch = {unixify: true};
    }

    const type: string = typeof options.type === "string" ? options.type : "css";

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
        ? (args: OnResolveArgs) => {
            for (const [type, isMatch] of matchers) if (isMatch(args)) {
                return type;
            }
            return type;
        }
        : () => type;

    function pathResolve({resolveDir, path}: OnResolveArgs) {
        return resolve(resolveDir, path);
    }

    function requireResolve({resolveDir, path}: OnResolveArgs) {
        const paths = options.includePaths ? [resolveDir, ...options.includePaths] : [resolveDir];
        return require.resolve(path, {paths});
    }

    const moduleDirectory = path.join(options.basedir!,"node_modules").replace(/\\/g, "/");

    function renderSync(file) {
        const {css} = sass.renderSync({
            importer: url => ({file: url.replace(/^~/, moduleDirectory)}),
            ...options,
            file
        });
        return css.toString("utf-8");
    }

    return {
        name: "sass-plugin",
        setup: function (build) {

            build.onResolve({filter: /\.(s[ac]ss|css)$/}, (args) => {
                return {path: args.path, namespace: "sass", pluginData: args};
            });

            let cached: (
                resolve: (args: OnResolveArgs) => string,
                transform: (filename: string, type: string) => OnLoadResult
            ) => (args) => OnLoadResult;

            if (options.cache !== false) {
                const cache = new Map<string, Map<string, CachedResult>>();
                cached = (resolve, transform) => ({pluginData: args}: OnLoadArgs) => {
                    let group = cache.get(args.resolveDir);
                    if (!group) {
                        group = new Map();
                        cache.set(args.resolveDir, group);
                    }
                    let cached = group.get(args.path);
                    if (cached) {
                        let {filename, mtimeMs, result} = cached;
                        let stats = statSync(filename);
                        if (stats.mtimeMs <= mtimeMs) {
                            return cached.result;
                        }
                        cached.result = transform(filename, cached.type);
                        return result;
                    } else {
                    }
                    let filename = resolve(args);
                    let type = typeOf(args);
                    let result = transform(filename, type);
                    let {mtimeMs} = statSync(filename);
                    group.set(args.path, {filename, type, mtimeMs, result});
                    return result;
                };
            } else {
                cached = (resolve, transform) => ({pluginData: args}: OnLoadArgs) => {
                    return transform(resolve(args), typeOf(args));
                };
            }

            function transform(path: string, type: string): OnLoadResult {
                let contents = path.endsWith(".css") ? readFileSync(path, "utf-8") : renderSync(path);
                return type === "css" ? {
                    contents: contents,
                    loader: "css" as Loader
                } : {
                    contents: makeModule(contents, type),
                    loader: "js" as Loader,
                    resolveDir: dirname(path)
                };
            }

            build.onLoad({filter: /^\.\.?\//, namespace: "sass"}, cached(pathResolve, transform));
            build.onLoad({filter: /^([^.]|\.\.?[^/])/, namespace: "sass"}, cached(requireResolve, transform));
        }
    };
}
