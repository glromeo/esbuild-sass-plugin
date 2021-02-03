import {Plugin} from "esbuild";
import {dirname, resolve} from "path";
import picomatch from "picomatch";
import {readFileSync} from "fs";
import {Options, renderSync} from "sass";

export type SassPluginOptions = Options & {
    basedir?: string
    type?: string | Record<string, string[]>
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
            build.onLoad({filter: /./, namespace: "sass"}, ({path}) => {
                let contents = path.endsWith(".css") ? readFileSync(path, "utf-8") : transform(path);
                if (types) {
                    for (const [type, accepts] of types) {
                        if (accepts(path)) {
                            if (type === "css") {
                                return {contents: contents, loader: "css"};
                            } else {
                                return {
                                    contents: makeModule(contents, type),
                                    loader: "js",
                                    resolveDir: dirname(path)
                                };
                            }
                        }
                    }
                } else {
                    return {contents: contents, loader: "css"};
                }
            });
        }
    };
}
