import * as esbuild from 'esbuild';
import { sassPlugin, postcssModules } from '../../../lib/index.js';
import fs from 'node:fs/promises'
import path from 'node:path';

await fs.rm('dist', { recursive: true, force: true });

await esbuild.build({
  entryPoints: ['./src/index.js'],
	format: 'esm',
	target: ['esnext'],
  outdir: 'dist',
  sourcemap: true,
  bundle: true,
  loader: {
    '.svg': 'dataurl',
  },
  plugins: [
    sassPlugin({
      filter: /\.module\.scss$/,
      transform: postcssModules({}),
      precompile(source, pathname) {
        const basedir = path.dirname(pathname);
        return source.replace(/(url\(['"]?)(\.\.?\/)([^'")]+['"]?\))/g, `$1${basedir}/$2$3`);
      },
    }),
  ],
});
