const esbuild = require("esbuild");
const {sassPlugin} = require("../../../lib");

const magicImporter = require('node-sass-magic-importer');

let importer = magicImporter();

esbuild.build({
    entryPoints: [
        "main.scss"
    ],
    bundle: false,
    outfile: "styles.css",
    sourcemap: true,
    plugins: [
        sassPlugin({
            implementation: "node-sass",
            // importer: importer
        })
    ],
    logLevel: "debug",
    watch: {
        onRebuild(failure, result) {
            console.log(new Date().toLocaleTimeString(), failure ? "rebuild failed" : "rebuild done");
        }
    }
}).then(() => {
    console.log("build done");
}).catch(() => {
    console.log("build failed");
    process.exit(1);
});
