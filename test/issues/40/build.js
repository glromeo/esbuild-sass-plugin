const esbuild = require("esbuild");
const {sassPlugin} = require("../../../lib");

esbuild
    .build({
        entryPoints: ["index.js"],
        outdir: "./out",
        bundle: true,
        plugins: [
            sassPlugin({
                importer(url) {
                    if (url === "..") {
                        return {contents: `/* $env!!! */\n$color: ${"blue"};\n`}
                    }
                    return null;
                }
            })
        ]
    })
    .then(console.log)
    .catch(console.error);