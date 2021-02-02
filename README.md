![logo created with https://cooltext.com](https://images.cooltext.com/5500652.png)

[![Build Status][travis-image]][travis-url]

A plugin for [esbuild](https://esbuild.github.io/) to handle sass & scss files.
##### Main Features
* css loader
* css result modules or dynamic style added to main page
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

If you specify `format: "style"` then the stylesheet will be dynamically added to the page. 

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
if you specify the format `"lit-css"` like this: 
```javascript
await esbuild.build({
    ...
    plugins: [sassPlugin({
        format: "lit-css",
        ... // other options for sass.renderSync(...)
    })]
});
```

Look in the `test` folder for more usage examples.

The **options** passed to the plugin are a superset of the sass [Options](https://sass-lang.com/documentation/js-api#options).

### TODO:

* css in js modules
* refactor the options

### Benchmarks
```
... coming soon
```

### License

MIT

[travis-url]: https://travis-ci.org/glromeo/esbuild-sass-plugin
[travis-image]: https://travis-ci.org/glromeo/esbuild-sass-plugin.svg?branch=main
