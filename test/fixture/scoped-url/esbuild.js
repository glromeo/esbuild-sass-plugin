const {sassPlugin} = require("../../../lib/index.js");
const path = require("path");

require("esbuild").build({
  entryPoints: ["./src/index.js"],
  outfile: "./out/index.js",
  bundle: true,
  loader: {
    ".js": "jsx",
    ".png": "file"
  },
  plugins: [
    sassPlugin({
      precompile(source, pathname) {
        const basedir = path.dirname(pathname).replace(/\\/g, "/")
        return source.replace(/(url\(['"]?)(\.\.?\/)?([^'")]+['"]?\))/g, `$1${basedir}/$2$3`)
      }
    })
  ]
}).catch(() => process.exit(1));
