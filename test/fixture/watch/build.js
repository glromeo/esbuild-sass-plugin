const {sassPlugin} = require("../../../lib");
const esbuild = require("esbuild");

esbuild.build({
    entryPoints: ["./src/index.js"],
    outdir: "./out",
    bundle: true,
    plugins: [sassPlugin({type:"css-text"})],
    watch: {
        onRebuild(error, result) {
            if (error) console.error("watch build failed:", error);
            else console.log("watch build succeeded:", result);
        }
    }
});