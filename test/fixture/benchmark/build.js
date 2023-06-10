const esbuild = require('esbuild')
const sass = require('sass')
const {sassPlugin} = require('../../../lib')
const {cleanFixture} = require('../utils')

cleanFixture(__dirname)

console.time('generate')
require("./generate")
console.timeEnd('generate');

(async ()=>{

  console.time('context')

  const ctx = await esbuild.context({
    entryPoints: ["./src/generated/index.ts"],
    bundle: true,
    format: 'esm',
    sourcemap: false,
    outdir: './out',
    define: {'process.env.NODE_ENV': '"development"'},
    plugins: [
      sassPlugin({
        filter: /^\.\.\/index.scss$/,
        type: 'style',
        cache: true,
        logger: sass.Logger.silent
      }),
      sassPlugin({
        type: 'lit-css',
        cache: true,
        quietDeps: true,
        logger: sass.Logger.silent
      }),
      {
        name: "watcher",
        setup: ({onStart, onEnd}) => {
          onStart(()=>{
            console.time("(re)build");
          })

          onEnd(()=>{
            console.timeEnd("(re)build");
          })
        }
      }
    ],
    logLevel: 'debug'
  })

  console.timeEnd('context');
  console.time('watch')

  await ctx.watch();
  await ctx.rebuild();

  console.timeEnd('watch');

})().catch(console.error);
