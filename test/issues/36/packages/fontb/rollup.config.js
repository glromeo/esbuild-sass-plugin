import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import postcss from 'rollup-plugin-postcss';
import url from 'postcss-url';

export default {
  input: 'src/FontB.tsx',
  output: {
    sourcemap: true,
    dir: 'dist',
    format: 'cjs',
  },
  plugins: [
    resolve(),
    commonjs(),
    typescript(),
    postcss({
      plugins: [
        url({
          basePath: "../../",
          url: 'inline'
        }),
      ],
    }),
  ],
};
