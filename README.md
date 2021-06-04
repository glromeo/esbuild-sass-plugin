![logo created with https://cooltext.com](https://images.cooltext.com/5500652.png)

[![Build Status][travis-image]][travis-url]

A plugin for [esbuild](https://esbuild.github.io/) to handle sass & scss files.

##### Main Features
* defaults to using the `css loader`
* supports `constructable stylesheet` modules or `dynamic style` added to main page
* comes with [dart sass](https://www.npmjs.com/package/sass) but can be easily switched to [node-sass](https://github.com/sass/node-sass)
* caching
* PostCSS
* watch mode 🥳
### Install
```bash
npm i esbuild-sass-plugin
```

### Usage
Just add it to your esbuild plugins:
```javascript
import {sassPlugin} from "esbuild-sass-plugin";

await esbuild.build({
    ...
    plugins: [sassPlugin()]
});
```
this will use `loader: "css"` and your transpiled sass will be included in index.css.

If you specify `type: "style"` then the stylesheet will be dynamically added to the page. 

If you want to use the resulting css text as a string import you can use `type: "css-text"`

```javascript
await esbuild.build({
    ...
    plugins: [sassPlugin({
        type: "css-text",
        ... // other options for sass.renderSync(...)
    })]
});
```
...and in your module do something like
```javascript
...
import cssText from "./styles.scss";
...
customElements.define("hello-world", class HelloWorld extends HTMLElement {

    constructor() {
        super();
        this.attachShadow({mode: 'open'});
        this.sheet = new CSSStyleSheet();
        this.sheet.replaceSync(cssText);
        this.shadowRoot.adoptedStyleSheets = [this.sheet];
    }
}
```
Or you can import a **lit-element** css result using `type: "lit-css"`
```javascript
...
import styles from "./styles.scss";
...
@customElement("hello-world")
export default class HelloWorld extends LitElement {

    static styles = styles

    render() {
        ...
    }
}
```

Look in the `test` folder for more usage examples.

### Options

The **options** passed to the plugin are a superset of the sass [Options](https://sass-lang.com/documentation/js-api#options).

|Option|Type|Default|
|---|---|---|
|cache|boolean or Map|true|
|type|string or array|`"css"`|
|implementation|string|`"sass"`|
|transform|function|undefined|
|exclude|regex|undefined|


If you want to have different loaders for different parts of your code you can pass `type` an array. 

Each item is going
to be: 
* the type (one of: `css`, `css-text`, `lit-css` or `style`)
* a valid [picomatch](https://github.com/micromatch/picomatch) glob, an array of one such glob or an array of two. 

e.g.
```javascript
await esbuild.build({
    ...
    plugins: [sassPlugin({
        type: [                                     // this is somehow like a case 'switch'...
            ["css", "bootstrap/**"],                // ...all bootstrap scss files (args.path) 
            ["style", ["src/nomod/**"]],            // ...all files imported from files in 'src/nomod' (args.importer) 
            ["style", ["**/index.ts","**/*.scss"]], // all scss files imported from files name index.ts (both params)
            ["lit-css"]                             // this matches all, similar to a case 'default'
        ],
    })]
})
```
**NOTE**: last type applies to all the files that don't match any matchers.

### Exclude Option
Used to exclude paths from the plugin

e.g.
```javascript
await esbuild.build({
    ...
    plugins: [sassPlugin({
        exclude: /^http:\/\//,  // ignores urls
    })]
})
```

### Transform Option
```typescript
async (css:string, resolveDir:string?) => string
``` 
It's function which will be invoked before passing the css to esbuild or wrapping it in a module.

#### PostCSS
The simplest use case is to invoke PostCSS like this:
```javascript
const postcss = require("postcss");
const autoprefixer = require("autoprefixer");
const postcssPresetEnv = require("postcss-preset-env");

esbuild.build({
    ...
    plugins: [sassPlugin({
        async transform(source, resolveDir) {
            const {css} = await postcss([autoprefixer, postcssPresetEnv({stage:0})]).process(source);
            return css;
        }
    })]
});
```

#### esbuild
But it can be used to invoke esbuild to do some post processing of the css like in this example
where I rely on esbuild to create data urls:
```javascript
await esbuild.build({
  entryPoints: ["./src/index.ts"],
  outdir: "./out",
  bundle: true,
  format: "esm",
  plugins: [sassPlugin({
    type: "lit-css",
    async transform(css, resolveDir) {
      const {outputFiles:[out]} = await esbuild.build({
        stdin: {
          contents: css,
          resolveDir,
          loader: "css"
        },
        bundle: true,
        write: false,
        format: "esm",
        loader: {
          ".eot": "dataurl",
          ".woff": "dataurl",
          ".ttf": "dataurl",
          ".svg": "dataurl",
          ".otf": "dataurl"
        },
      });
      return out.text;
    }
  })]
});
```

I am not really happy with this but I am waiting on esbuild to revamp its plugin api before finding another way to achieve the same result.

Look at **open-iconic** test **fixture** for a working example.

### Use node-sass instead of sass
Remember to add the dependency
```bash
npm i esbuild-sass-plugin node-sass
```
and to specify the implementation in the options:
```javascript
await esbuild.build({
    ...
    plugins: [sassPlugin({
        implementation: "node-sass",
        ... // other options for sass.renderSync(...)
    })]
});
```

### CACHING

It greatly improves the performance in incremental builds or watch mode.

It has to be enabled with `cache: true` in the options. 

You can pass your own map instead of true if you want to recycle it across different builds.
```javascript
const pluginCache = new Map();

await esbuild.build({
    ...
    plugins: [sassPlugin({cache: pluginCache})],
    ...
})
```


### Benchmarks
Given 24 x 24 = 576 lit-element files & 576 imported css styles
#### cache: true
```
initial build: 2.033s
incremental build: 1.199s     (one ts modified)
incremental build: 512.429ms  (same ts modified again)
incremental build: 448.871ms  (one scss modified)
incremental build: 448.92ms   (same scss modified)
```
#### cache: false
```
initial build: 1.961s
incremental build: 1.986s     (touch 1 ts)
incremental build: 1.336s     (touch 1 ts)
incremental build: 1.069s     (touch 1 scss)
incremental build: 1.061s     (touch 1 scss)
```
#### node-sass
```
initial build: 1.030s
incremental build: 468.677ms  (one ts modified) 
incremental build: 347.55ms   (same ts modified again)
incremental build: 401.264ms  (one scss modified)
incremental build: 364.649ms  (same scss modified)
```


### TODO:

* css in js modules
* refactor the options
* (more?) speed improvements

### License

MIT

[travis-url]: https://travis-ci.com/glromeo/esbuild-sass-plugin
[travis-image]: https://travis-ci.com/glromeo/esbuild-sass-plugin.svg?branch=main
