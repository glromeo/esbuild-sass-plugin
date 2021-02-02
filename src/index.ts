import {Plugin} from "esbuild";
import * as path from "path";
import {Options, renderSync} from "sass";

export type SassPluginOptions = Options & {
    basedir?: string
    include?: string[]
    exclude?: string[]
    format?: "lit-css" | "style" | undefined
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

function makeModule(contents: string, format: "lit-css" | "style") {
    return format === "style" ? styleModule(contents) : cssResultModule(contents);
}

export function sassPlugin(options: SassPluginOptions = {}): Plugin {
    const basedir = options.basedir ?? process.cwd();
    const accept = options.include ?
    return {
        name: "sass-plugin",
        setup(build) {
            build.onResolve({filter: /\.(s[ac]ss|css)$/}, args => {
                let paths = options.includePaths ? [args.resolveDir, ...options.includePaths] : [args.resolveDir];
                let path = require.resolve(args.path, {paths});
                if (accept(path)) {
                    return {path: path, namespace: "sass"};
                }
            });
            build.onLoad({filter: /./, namespace: "sass"}, args => {
                const {css} = renderSync({
                    ...options,
                    file: args.path
                });
                const contents = css.toString("utf-8");
                if (options.format) {
                    return {
                        contents: makeModule(contents, options.format),
                        loader: "js",
                        resolveDir: path.dirname(args.path)
                    };
                } else {
                    return {contents: contents, loader: "css"};
                }
            });
        }
    };
}
