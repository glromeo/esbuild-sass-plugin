const { build } = require('esbuild');
const { sassPlugin, postcssModules } = require('../../../../../lib');
const { dtsPlugin } = require('esbuild-plugin-d.ts');

const postcssUrl = require("postcss-url");

build({
  bundle: true,
  sourcemap: true,
  minify: true,
  splitting: true,
  format: 'esm',
  target: ['esnext'],
  entryPoints: ['src/FontA.tsx'],
  outdir: 'dist/',
  loader: {
    '.woff': 'dataurl',
    '.woff2': 'dataurl',
  },
  plugins: [
    sassPlugin({
      type: 'css-text',
      transform: postcssModules({}, [
        postcssUrl({
          basePath: "../../",
          url: 'inline'
        })
      ]),
    }),
    dtsPlugin(),
  ],
}).catch(e => console.error(e.message));
