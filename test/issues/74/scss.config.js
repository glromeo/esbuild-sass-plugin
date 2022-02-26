const esbuild = require("esbuild");
const {sassPlugin} = require("../../../lib");

esbuild.build({
    entryPoints: ["./src/formio.scss"],
    bundle: true,
    outdir: "./out",
    plugins: [sassPlugin({cssImports: true})]
}).catch(() => {
    process.exit(1);
});
