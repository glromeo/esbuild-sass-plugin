const {pnpPlugin} = require("@yarnpkg/esbuild-plugin-pnp");
const {sassPlugin} = require("../esbuild-sass-plugin/lib/index.js");

require("esbuild").build({
  entryPoints: ["./src/index.js"],
  outfile: "out.js",
  bundle: true,
  loader: {
    ".js": "jsx",
    ".eot": "file",
    ".woff": "file",
    ".ttf": "file",
    ".svg": "file",
    ".otf": "file"
  },
  target: ["es2019"],
  plugins: [
    sassPlugin(),
    pnpPlugin({
      filter: /^[^d][^a][^t][^a][^:].*/,
      extensions: [`.tsx`, `.ts`, `.jsx`, `.mjs`, `.cjs`, `.js`, `.css`, `.json`, `.scss`]
    })
  ]
}).catch(() => process.exit(1));
