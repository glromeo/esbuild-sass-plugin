#!/usr/bin/env node

const { build } = require("esbuild");
const { sassPlugin } = require("../../../lib/index");

build({
  entryPoints: ["styles/application.scss"],
  bundle: true,
  logLevel: "info",
  outdir: "builds",
  plugins: [sassPlugin({ cssImports: true })],
})
  .then(() => console.log("⚡ Build complete! ⚡"))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
