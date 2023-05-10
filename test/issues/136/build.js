const esbuild = require("esbuild");
const {sassPlugin} = require("../../../lib/index");
const path = require("path");

esbuild.build({
    entryPoints: ["./src/index.ts"],
    bundle: true,
    outdir: "./out",
    plugins: [sassPlugin({
        importMapper: (filepath) => {
            const transformed = filepath.replace(/^local:src\//, path.resolve(__dirname, "src") + "/")
            console.log(`Received ${filepath} --> converting to ${transformed}`);
            return transformed;
        }
    })]
}).catch(() => process.exit(1));
