import esbuild from "esbuild";
import esbuildSassPlugin from "../../../lib/index.js";

const {sassPlugin, postcssModules} = esbuildSassPlugin;

esbuild.build({
    entryPoints: ["./src/index.js"],
    outdir: "build/",
    bundle: true,
    format: "esm",
    plugins: [
        sassPlugin({
            transform: postcssModules({
                localsConvention: "camelCaseOnly"
            })
        }),
    ]
}).catch(() => process.exit(1));
