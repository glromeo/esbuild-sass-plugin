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
Just add it to the esbuild plugins:
```javascript
import {sassPlugin} from "esbuild-sass-plugin";

await esbuild.build({
    ...
    plugins: [sassPlugin({
        format: "lit-css",
        ... // other options for sass.renderSync(...)
    })]
});
```
look in the `test` folder for more usage examples.

The **options** passed to the plugin are a superset of the sass [Options](https://sass-lang.com/documentation/js-api#options).

### TODO:

* sass import resolution

### Benchmarks
```
... coming soon
```

### License

MIT

[travis-url]: https://travis-ci.org/glromeo/esbuild-sass-plugin
[travis-image]: https://travis-ci.org/glromeo/esbuild-sass-plugin.svg?branch=main
