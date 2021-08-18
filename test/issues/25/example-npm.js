const esbuild = require("esbuild");
const {sassPlugin} = require("esbuild-sass-plugin");

// given node-sass has been installed with `npm i -g node-sass`;

const {execSync} = require('child_process');

const includePath = execSync("npm root --global", {encoding: "utf-8"}).trim();

esbuild.build({
    entryPoints: ["./index.js"],
    bundle: true,
    outdir: "./out",
    plugins: [sassPlugin({
        implementation: "node-sass",
        includePaths: [includePath]
    })]
});
