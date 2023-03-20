#!/usr/bin/env node

const { build } = require("esbuild");
const { sassPlugin } = require("../../../lib/index.js");

build({
  entryPoints: ["styles/application.scss"],
  bundle: true,
  logLevel: "info",
  outdir: "out",
  plugins: [sassPlugin({ cssImports: true, prefer: "sass" })],
})
  .then(() => console.log("⚡ Build complete! ⚡"))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
