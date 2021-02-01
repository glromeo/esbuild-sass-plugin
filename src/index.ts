import {Plugin} from "esbuild";
import * as path from "path";
import {Options, renderSync} from "sass";

export type SassPluginOptions = {}

export function sassPlugin(options: SassPluginOptions): Plugin {
    const sassOption: Options = {};
    return {
        name: "sass-plugin",
        setup(build) {
            build.onResolve({filter: /\.(sass|scss)$/}, args => {
                return {path: path.resolve(args.resolveDir, args.path), namespace: "sass"};
            });
            build.onLoad({filter: /./, namespace: "sass"}, args => {
                const {css} = renderSync({
                    ...sassOption,
                    file: args.path
                });
                const contents = css.toString("utf-8");
                return {contents: contents, loader: "css"};
            });
        }
    };
}
