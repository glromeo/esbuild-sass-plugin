const {build} = require("esbuild");
const {sassPlugin} = require("../../../lib");
const path = require("path");
const {cleanFixture, logSuccess, logFailure} = require('../../fixture/utils')

cleanFixture(__dirname)

let last;

build({
    entryPoints: ["src/index.jsx"],
    outdir: "out",
    bundle: true,
    plugins: [
        sassPlugin({})
    ]
}).then(logSuccess, logFailure)