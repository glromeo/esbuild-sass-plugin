![logo created with https://cooltext.com](https://images.cooltext.com/5500652.png)

[![Build Status][travis-image]][travis-url]

A plugin for [esbuild](https://esbuild.github.io/) to handle sass & scss files.

##### Main Features
* defaults to using the `css loader`
* `css result` modules or `dynamic style` added to main page
* uses [dart sass](https://www.npmjs.com/package/sass)

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

Alternatively you can import a **lit-element** css result:
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
if you specify the type `"lit-css"` like this: 
```javascript
await esbuild.build({
    ...
    plugins: [sassPlugin({
        type: "lit-css",
        ... // other options for sass.renderSync(...)
    })]
});
```

Look in the `test` folder for more usage examples.

### Options

The **options** passed to the plugin are a superset of the sass [Options](https://sass-lang.com/documentation/js-api#options).

|Option|Type|Default|
|---|---|---|
|cache|boolean|true|
|type|string or array|`"css"`|

If you want to have different loaders for different parts of your code you can pass `type` an array. 

Each item is going
to be: 
* the type (one of: `css`, `lit-css` or `style`)
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

### CACHING

It greatly improves the performance in incremental builds or watch mode.

It has to be enabled with `cache: true` in the options. 

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

### TODO:

* css in js modules
* refactor the options
* (more?) speed improvements

### License

MIT

[travis-url]: https://travis-ci.com/glromeo/esbuild-sass-plugin
[travis-image]: https://travis-ci.com/glromeo/esbuild-sass-plugin.svg?branch=main
