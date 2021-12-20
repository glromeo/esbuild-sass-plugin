const esbuild = require("esbuild");
const {sassPlugin} = require("../../../lib");

const blue = "blue";

esbuild
    .build({
        entryPoints: ["index.js"],
        outdir: "./out",
        bundle: true,
        plugins: [
            sassPlugin({
                importer(url) {
                    if (url === "..") {
                        return {contents: `
                            $color: ${blue};
                        `}
                    }
                    return null;
                }
            })
        ]
    })
    .then(console.log)
    .catch(console.error);