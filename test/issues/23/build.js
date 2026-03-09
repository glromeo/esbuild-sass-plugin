const esbuild = require("esbuild");
const {sassPlugin} = require("../../../lib");
const path = require("path");
const {cleanFixture, logSuccess, logFailure} = require("../../fixture/utils");

cleanFixture(__dirname);

esbuild.build({
  entryPoints: ["./index.js"],
  bundle: true,
  outdir: "./out",
  plugins: [
    sassPlugin({
      type: "style",
      quietDeps: true
    })]
}).then(logSuccess, logFailure);