const {sassPlugin} = require("../../../lib");
const esbuild = require("esbuild");

esbuild.build({
    entryPoints: ["./src/index.ts", "./src/styles.scss"],
    outdir: "out",
    bundle: true,
    minify: false,
    sourcemap: true,
    format: "esm",
    plugins: [sassPlugin({
        async transform(css, resolveDir) {
            const {outputFiles:[out]} = await esbuild.build({
                stdin: {
                    contents: css,
                    resolveDir,
                    loader: "css"
                },
                bundle: true,
                write: false,
                format: "esm",
                loader: {
                    ".eot": "dataurl",
                    ".woff": "dataurl",
                    ".ttf": "dataurl",
                    ".svg": "dataurl",
                    ".otf": "dataurl"
                },
            });
            return out.text;
        }
    })]
});