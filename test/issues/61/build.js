const {build} = require("esbuild");
const {sassPlugin} = require("../../../lib");
const {cleanFixture, logSuccess, logFailure} = require('../../fixture/utils')

cleanFixture(__dirname)

build({
    entryPoints: ["src/index.jsx"],
    outdir: "out",
    bundle: true,
    plugins: [
        sassPlugin()
    ],
    charset: 'utf8'
}).then(logSuccess, logFailure)