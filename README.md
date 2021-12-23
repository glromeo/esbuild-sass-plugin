![cooltext394785080075403](https://user-images.githubusercontent.com/160981/136289874-26ce7269-ea08-47dd-be31-9bf0ef7a0b8d.png)

[![Build Status][travis-image]][travis-url]

A plugin for [esbuild](https://esbuild.github.io/) to handle Sass & SCSS files.

**NOTE:** This is the 2.x branch of the plugin, if you want to use node-sass or an old feature please stick to the 1.x
branch

### Features

* **PostCSS** & **CSS modules**
* support for **constructable stylesheet** to be used in custom elements or `dynamic style` to be added to the html page
* uses the **new [Dart Sass](https://www.npmjs.com/package/sass) Js API**.
* caching
* **url rewriting**
* pre-compiling (to add **global resources** to the sass files)

### Breaking Changes

* `type` has been simplified and now accepts only a string. If you need different types in a project you can use more
  than one instance of the plugin. You can have a look at the **exclude** fixture for an example_ where **lit CSS**
  and **CSS modules** are both used in the same app
* The support for [node-sass](https://github.com/sass/node-sass) has been removed from the 2.x branch and for good.
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

this will use `loader: "css"` and your transpiled Sass will be included in index.css.

If you specify `type: "style"` then the stylesheet will be dynamically added to the page.

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

The **options** passed to the plugin are a superset of the
Sass [Options](https://sass-lang.com/documentation/js-api#options).

| Option       | Type                                  | Default                                |
|--------------|---------------------------------------|----------------------------------------|
| cache        | boolean or Map                        | true (one Map per namespace)           |
| type         | `"css"`<br/>`"style"`<br/>`"lit-css"` | `"css"`                                |
| transform    | function                              | undefined                              |
| loadPaths    | [string[]]()                          | collection of node_modules from cwd up |
| importer     | function                              | undefined                              |
| importMapper | function                              | undefined                              |

### Exclude Option

Used to exclude paths from the plugin. It can either be **a simple regex** which applies to the path

```javascript
await esbuild.build({
  ...
    plugins
:
[sassPlugin({
  exclude: /^http:\/\//,  // ignores urls
})]
})
```

**or a function** which receives the whole set of args that esbuild passes on resolve.

```javascript
await esbuild.build({
  ...
    plugins
:
[sassPlugin({
  exclude: ({resolveDir}) => !/\\lit$/.test(resolveDir),  // ignores files outside lit directory
})]
})
```

### Importer Option

The default importer built in the plugin has been developed to be fast but its scope is limited. For complex import
scenarios (e.g pnpm)
this can be replaced by a custom implementation like the very
solid [`sass-extended-importer`](https://github.com/wessberg/sass-extended-importer)

```javascript
const {createImporter} = require("sass-extended-importer");

await esbuild.build({
  ...,
  plugins:[sassPlugin({
    importer: createImporter()
  })]
})
```

There's a working example of using `pnpm` with `@material` design
in [issue/38](https://github.com/glromeo/esbuild-sass-plugin/tree/main/test/issues/38)

### ImportMapper Option

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

### Transform Option

```typescript
async (css: string, resolveDir: string?) => string
``` 

It's a function which will be invoked before passing the css to esbuild or wrapping it in a module.\
It can be used to do **PostCSS** processing and/or to create **modules** like in the following examples.

#### PostCSS

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

#### CSS Modules

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


### Benchmarks

Given 24 × 24 = 576 lit-element files & 576 imported CSS styles plus the import of the full bootstrap 5.1

|                        | dart sass  | dart sass (no cache)  | node-sass*  | node-sass (no cache) |
|------------------------|------------|-----------------------|-------------|----------------------|
| **initial build**      | 2.946s     | 2.945s                | 1.903s      | 1.858s               |
| rebuild (.ts change)   | 285.959ms  | 1.950s                | 797.098ms   | 1.689s               |
| rebuild (.ts change)   | 260.791ms  | 1.799s                | 768.213ms   | 1.790s               |
| rebuild (.scss change) | 234.152ms  | 1.801s                | 770.619ms   | 1.652s               |
| rebuild (.scss change) | 267.857ms  | 1.738s                | 750.743ms   | 1.682s               |

(*) node-sass is here just to give a term of comparison ...those samples were taken from 1.8.x

[travis-url]: https://travis-ci.com/glromeo/esbuild-sass-plugin
[travis-image]: https://travis-ci.com/glromeo/esbuild-sass-plugin.svg?branch=main
