const esbuild = require("esbuild");
const {sassPlugin} = require("../../../lib");
const path = require("path");
const {cleanFixture, logSuccess, logFailure} = require('../../fixture/utils')

cleanFixture(__dirname)

esbuild.build({
    entryPoints: ["src/index.jsx"],
    outdir: "public",
    bundle: true,
    plugins: [
        sassPlugin({
            loadPaths: [
                path.resolve(__dirname, "./node_modules"),
                path.resolve(__dirname, "./node_modules/.pnpm/node_modules"),
            ]
        })
    ]
}).then(logSuccess, logFailure)