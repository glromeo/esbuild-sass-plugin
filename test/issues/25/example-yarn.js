const esbuild = require("esbuild");
const {sassPlugin} = require("esbuild-sass-plugin");

// given sass has been installed with `yarn global add sass`;

const {execSync} = require('child_process');

const yarnGlobalDir = execSync("yarn global dir", {encoding: "utf-8"}).trim();
const includePath = `${yarnGlobalDir}/node_modules`;

esbuild.build({
    entryPoints: ["./index.js"],
    bundle: true,
    outdir: "./out",
    plugins: [sassPlugin({
        loadPaths: [includePath]
    })]
});
