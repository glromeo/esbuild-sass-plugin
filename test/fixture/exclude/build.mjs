import esbuild from "esbuild";
import esbuildSassPlugin from "../../../lib/index.js";
import {sep, posix} from "path";

const {sassPlugin, postcssModules} = esbuildSassPlugin;

const IS_LIT_BRANCH = sep === posix.sep ? /\/lit$/ : /\\lit$/;

esbuild.build({
    entryPoints: ["./src/main.js"],
    outdir: "./public",
    bundle: true,
    format: "esm",
    plugins: [
        sassPlugin({
            exclude: ({resolveDir}) => !IS_LIT_BRANCH.test(resolveDir),
            type: "lit-css"
        }),
        sassPlugin({
            exclude: ({path}) => !path.endsWith(".module.scss"),
            transform: postcssModules({
                localsConvention: "camelCaseOnly"
            }),
            type: "css"
        }),
    ]
}).catch(() => process.exit(1));
