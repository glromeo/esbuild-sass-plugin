const esbuild = require("esbuild");
const {sassPlugin} = require("../../../lib");
const path = require("path");

const {createImporter} = require("sass-extended-importer");

esbuild.build({
    entryPoints: ["src/index.jsx"],
    outdir: "public",
    bundle: true,
    plugins: [
        sassPlugin({
            includePaths: [
                path.resolve(__dirname, "./node_modules"),
                path.resolve(__dirname, "./node_modules/.pnpm/node_modules"),
            ],
            importer: createImporter()
        })
    ]
}).then(console.log).catch(console.error);