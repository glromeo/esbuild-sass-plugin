const {sassPlugin} = require("../../../lib/index.js");

require("esbuild").build({
  entryPoints: ["./src/index.js"],
  outfile: "./out/index.js",
  bundle: true,
  loader: {
    ".js": "jsx",
    ".png": "file"
  },
  plugins: [
    sassPlugin()
  ]
}).catch(() => process.exit(1));
