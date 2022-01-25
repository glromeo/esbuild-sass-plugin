![cooltext394785080075403](https://user-images.githubusercontent.com/160981/136289874-26ce7269-ea08-47dd-be31-9bf0ef7a0b8d.png)
![image](https://user-images.githubusercontent.com/160981/150880682-4915c4dd-726b-4fea-8f3b-597d191f05bc.png)

[![Build Status][travis-image]][travis-url]

A plugin for [esbuild](https://esbuild.github.io/) to handle Sass & SCSS files.

### Features
* **PostCSS** & **CSS modules**
* support for **constructable stylesheet** to be used in custom elements or `dynamic style` to be added to the html page
* uses the **new [Dart Sass](https://www.npmjs.com/package/sass) Js API**.
* caching
* **url rewriting**
* pre-compiling (to add **global resources** to the sass files)

### Breaking Changes
* `type` has been simplified and now accepts only a string. If you need different types in a project [you can use more
  than one instance](https://github.com/glromeo/esbuild-sass-plugin/issues/60) of the plugin. 
  You can have a look at the [**multiple** fixture](https://github.com/glromeo/esbuild-sass-plugin/blob/main/test/fixture/multiple) 
  for an example where **lit CSS** and **CSS modules** are both used in the same app
* The support for [node-sass](https://github.com/sass/node-sass) has been removed and for good.
  Sadly, node-sass is at a dead end and so it's 1.x. I don't exclude updates or fixes on it but it's down in the list of
  my priorities.

### Install

```console
$ npm i esbuild-sass-plugin
```

### Usage

Just add it to your esbuild plugins:

```javascript
import {sassPlugin} from 'esbuild-sass-plugin'

await esbuild.build({
  ...
  plugins: [sassPlugin()]
})
```

this will use esbuild `loader: "css"` and your transpiled Sass will be in `index.css` alongside your bundle.
There are two main options that control the plugin: `filter` which has the same meaning of filter in esbuild 
[onLoad](https://esbuild.github.io/plugins/#on-load) and `type` that's what specifies how the css should be
rendered and imported. 

If you specify `type: "style"` then the stylesheet will be in the bundle 
and will be dynamically added to the page when the bundle is loaded.

If you want to use the resulting css text as a string import you can use `type: "css-text"`

```javascript
await esbuild.build({
  ...
  plugins: [sassPlugin({
    type: "css-text",
    ...   // for the options availanle look at 'SassPluginOptions' in index.ts
  })]
})
```

...and in your module do something like

```javascript
import cssText from './styles.scss'

customElements.define('hello-world', class HelloWorld extends HTMLElement {
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
import styles from './styles.scss'

@customElement("hello-world")
export default class HelloWorld extends LitElement {

  static styles = styles

  render() {
    ...
  }
}
```

Look in `test/fixtures` folder for more usage examples.

### Options

The **options** passed to the plugin are a superset of Sass
[compile string options](https://sass-lang.com/documentation/js-api/interfaces/StringOptionsWithImporter).

| Option                                               | Type                                  | Default                                 |
|------------------------------------------------------|---------------------------------------|-----------------------------------------|
| [filter](https://esbuild.github.io/plugins/#on-load) | regular expression                    | <code>/\.(s[ac]ss&vert;css)$/</code>    |
| cache                                                | boolean or Map                        | `true` (there is one Map per namespace) |
| type                                                 | `"css"`<br/>`"style"`<br/>`"lit-css"` | `"css"`                                 |
| transform                                            | function                              | undefined                               |
| [loadPaths](https://www.shorturl.at/bdpBS)           | string[]                              | []                                      |
| importer                                             | function                              | built in importer                       |
| precompile                                           | function                              | undefined                               |
| importMapper                                         | function                              | undefined                               |

### What happened to `exclude` ?
the option has been removed in favour of using `filter`. The default filter is quite simple but also quite permissive.
If you have URLs in your imports and you want the plugin to ignore them you can just change the filter to something like:
```javascript
sassPlugin({
  filter: /^(?!https?:).*\.(s[ac]ss|css)$/
  ...
})
```

### `importMapper`

A function to customize/re-map the import path, both `import` statements in JavaScript/TypeScript code and `@import`
in Sass/SCSS are covered.   
You can use this option to re-map import paths like tsconfig's `paths` option.

e.g. given this `tsconfig.json` which maps image files paths

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@img/*": [
        "./assets/images/*"
      ]
    }
  }
}
```

now you can resolve these paths with `importMapper`

```javascript
await esbuild.build({
  ...,
  plugins: [sassPlugin({
    importMapper: (path) => path.replace(/^@img\//, './assets/images/')
  })]
})
```

### `precompile`

#### - Rewriting relative `url(...)`s
If your sass reference resources with relative urls (see [#48](https://github.com/glromeo/esbuild-sass-plugin/issues/48))
esbuild will struggle to rewrite those urls because it doesn't have idea of the imports that the Sass compiler 
has gone through. Fortunately the new importer API allows to rewrite those relative URLs in absolute ones which 
then esbuild will be able to handle.

Here is an example of how to do the `url(...)` rewrite ([make sure to handle `\` in *Windows*](https://github.com/glromeo/esbuild-sass-plugin/issues/58))
```javascript
const path = require('path')

await esbuild.build({
  ...,
  plugins: [sassPlugin({
    precompile(source, pathname) {
      const basedir = path.dirname(pathname)
      return source.replace(/(url\(['"]?)(\.\.?\/)([^'")]+['"]?\))/g, `$1${basedir}/$2$3`)
    }
  })]
})
```

#### - Globals and other Shims (like sass-loader's additionalData)
Look for a complete example in the [precompile](https://github.com/glromeo/esbuild-sass-plugin/tree/main/test/fixture/precompile) fixture

```javascript
const context = { color: "blue" }

await esbuild.build({
  ...,
  plugins: [sassPlugin({
    precompile(source, pathname) {
      const prefix = /\/included\.scss$/.test(pathname) ? `
            $color: ${context.color};
          ` : env
      return prefix + source
    }
  })]
})
```

### `transform`

```typescript
async (css: string, resolveDir?: string) => string
``` 

It's a function which will be invoked before passing the css to esbuild or wrapping it in a module.\
It can be used to do **PostCSS** processing and/or to create **modules** like in the following examples.

#### - PostCSS

The simplest use case is to invoke PostCSS like this:

```javascript
const postcss = require('postcss')
const autoprefixer = require('autoprefixer')
const postcssPresetEnv = require('postcss-preset-env')

esbuild.build({
  ...,
  plugins: [sassPlugin({
    async transform(source, resolveDir) {
      const {css} = await postcss([autoprefixer, postcssPresetEnv({stage: 0})]).process(source)
      return css
    }
  })]
})

```

#### - CSS Modules

A helper function is available to do all the work of calling PostCSS to create a CSS module. The usage is something
like:

```javascript
const {sassPlugin, postcssModules} = require('esbuild-sass-plugin')

esbuild.build({
  ...,
  plugins: [sassPlugin({
    transform: postcssModules({
      // ...put here the options for postcss-modules: https://github.com/madyankin/postcss-modules
    })
  })]
})

```

> **NOTE:** `postcss` and `postcss-modules` have to be added to your `package.json`.

`postcssModules` also accepts an optional array of plugins for PostCSS as second parameter.

Look into [fixture/css-modules](https://github.com/glromeo/esbuild-sass-plugin/tree/main/test/fixture/css-modules) for
the complete example.

> **NOTE:** Since `v1.5.0` transform can return either a string or an esbuild `LoadResult` object. \
> This gives the flexibility to implement that helper function.

### pnpm

There's a working example of using `pnpm` with `@material` design
in [issue/38](https://github.com/glromeo/esbuild-sass-plugin/tree/main/test/issues/38)

### Benchmarks
**Windows 10** Pro - **i7-4770K** CPU @ **3.50**GHz - RAM **24**GB - SSD **500**GB

Given 24 × 24 = 576 lit-element files & 576 imported CSS styles plus the import of the full bootstrap 5.1

|                        | dart sass | dart sass (no cache)  | node-sass*  | node-sass (no cache) |
|------------------------|-----------|-----------------------|-------------|----------------------|
| **initial build**      | 2.750s    | 2.750s                | 1.903s      | 1.858s               |
| rebuild (.ts change)   | 285.959ms | 1.950s                | 797.098ms   | 1.689s               |
| rebuild (.ts change)   | 260.791ms | 1.799s                | 768.213ms   | 1.790s               |
| rebuild (.scss change) | 234.152ms | 1.801s                | 770.619ms   | 1.652s               |
| rebuild (.scss change) | 267.857ms | 1.738s                | 750.743ms   | 1.682s               |

(*) node-sass is here just to give a term of comparison ...those samples were taken from 1.8.x

[travis-url]: https://app.travis-ci.com/glromeo/esbuild-sass-plugin
[travis-image]: https://app.travis-ci.com/glromeo/esbuild-sass-plugin.svg?branch=main
