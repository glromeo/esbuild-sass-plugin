import {Loader, OnLoadArgs, OnLoadResult, Plugin} from "esbuild";
import {readFileSync, statSync} from "fs";
import {dirname, resolve} from "path";
import picomatch from "picomatch";
import {Options, renderSync} from "sass";

export type SassPluginOptions = Options & {
    basedir?: string
    type?: string | Record<string, string[]>
    cache?: boolean
}

type CachedLoadResult = OnLoadResult & {
    mtimeMs: number
}

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

    const types: null | [string, (path: string) => boolean][] = !options.type
        ? null
        : typeof options.type === "string"
            ? [[options.type, path => true]]
            : typeof options.type === "object"
                ? Object.entries(options.type!).map(([key, value]) => [key, picomatch(value)])
                : null;

    const typeOf = types !== null
        ? path => {
            for (const [type, accepts] of types) if (accepts(path)) {
                return type;
            }
            return "css";
        }
        : path => "css";

    function caching(callback: (args: OnLoadArgs) => OnLoadResult) {
        if (options.cache) {
            const cache = new Map<string, { mtimeMs: number, result: OnLoadResult }>();
            return args => {
                let {mtimeMs} = statSync(args.path);
                let cached = cache.get(args.path);
                if (cached && cached.mtimeMs === mtimeMs) {
                    return cached.result;
                } else {
                    const result = callback(args);
                    cache.set(args.path, {mtimeMs, result});
                    return result;
                }
            }
        }
        return callback;
    }

    function transform(file) {
        const {css} = renderSync({
            ...options,
            file
        });
        return css.toString("utf-8");
    }

    return {
        name: "sass-plugin",
        setup(build) {
            build.onResolve({filter: /^\.\.?\/.*\.(s[ac]ss|css)$/}, ({path, resolveDir}) => {
                let resolved = resolve(resolveDir, path);
                return {path: resolved, namespace: "sass"};
            });
            build.onResolve({filter: /^([^.]|\.\.?[^/]).*\.(s[ac]ss|css)$/}, ({path, resolveDir}) => {
                let paths = options.includePaths ? [resolveDir, ...options.includePaths] : [resolveDir];
                let resolved = require.resolve(path, {paths});
                return {path: resolved, namespace: "sass"};
            });
            build.onLoad({filter: /./, namespace: "sass"}, caching(({path}) => {
                let contents = path.endsWith(".css") ? readFileSync(path, "utf-8") : transform(path);
                let type = typeOf(path);
                return type === "css" ? {
                    contents: contents,
                    loader: "css" as Loader
                } : {
                    contents: makeModule(contents, type),
                    loader: "js" as Loader,
                    resolveDir: dirname(path)
                };
            }));
        }
    };
}
