![cooltext394785080075403](https://user-images.githubusercontent.com/160981/136289874-26ce7269-ea08-47dd-be31-9bf0ef7a0b8d.png)
![image](https://github.com/glromeo/esbuild-sass-plugin/assets/160981/6a686a7c-ddd0-499f-b98d-03e607aac0a7)

[![Build Status][travis-image]][travis-url]

A plugin for [esbuild](https://esbuild.github.io/) to handle Sass & SCSS files.

### Features
* **PostCSS** & **CSS modules**
* support for **constructable stylesheet** to be used in custom elements or `dynamic style` to be added to the html page
* Support for **[Sass Embedded](https://github.com/sass/sass/issues/3296) Async API**
* caching
* **url rewriting**
* pre-compiling (to add **global resources** to the sass files)

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

### Options

You can pass a series of **options** to the plugin that are a superset of Sass
[compile string options](https://sass-lang.com/documentation/js-api/interfaces/stringoptions/). \
The following are the options specific to the plugin with their defaults where applicable:

| Option              | Type                                                                                              | Default                                  |
|---------------------|---------------------------------------------------------------------------------------------------|------------------------------------------|
| filter              | regular expression (in Go syntax)                                                                 | <code>/\.(s[ac]ss&vert;css)$/</code>     |
| type                | `"css"`<br/>`"local-css"`<br/>`"style"`<br/>`"lit-css"`<br/>`"css-text"` <br/> `(css:string,nonce?:string)=>string` | `"css"` |
| cache               | boolean or Map                                                                                    | `true` (there is one Map per namespace)  |
| transform           | function                                                                                          |                                          |
| loadPaths           | [string[]](https://sass-lang.com/documentation/js-api/interfaces/Options#loadPaths)               | []                                       |
| precompile          | function                                                                                          |                                          |
| importMapper        | function                                                                                          |                                          |
| cssImports          | boolean                                                                                           | false                                    |
| nonce               | string                                                                                            |                                          |
| prefer              | string                                                                                            | preferred package.json field             |
| namedExports        | boolean or function                                                                               | false                                    |
| quietDeps           | boolean                                                                                           | false                                    |
| silenceDeprecations | [string[]](https://sass-lang.com/documentation/js-api/interfaces/deprecations/)                   | []                                       |
| embedded            | boolean                                                                                           | false                                    |

Two main options control the plugin: `filter` which has the same meaning of filter in [esbuild](https://esbuild.github.io/plugins/#on-load)
allowing to select the URLs handled by a plugin instance, and `type` which specifies how the CSS should be rendered and imported.

### `filter`
The default filter is quite simple but also quite permissive. When specifying a custom regex bear in mind that this
is in [Go syntax](https://pkg.go.dev/regexp/syntax)

> If you have URLs in your imports and you want the plugin to ignore them you can't use a filter expression like:
`/^(?!https?:).*\.(s[ac]ss|css)$/` because *Go regex engine doesn't support lookarounds* but you can use
> **esbuild**'s `external` option to ignore these imports or try a [solution like this one](https://esbuild.github.io/plugins/#on-resolve).

You can list multiple plugin instances so that the most specific RegEx comes first:

```javascript
await esbuild.build({
  ...
  plugins: [
    sassPlugin({
      filter: /\.module\.scss$/,
      transform: postcssModules()
    }),
    sassPlugin({
      filter: /\.scss$/
    }),
  ],
  ...
})
```

### `embedded`

This option enables the faster `sass-embedded` and is **false** by default for compatibility.

> `sass-embedded` is not available on every platform, so it is a peer dependency. Install it manually
> if your package manager doesn't do it automatically, then set `embedded: true` to enjoy the speed boost!

### `type`

The example in [Usage](#usage) uses the default type `css` and will use esbuild's CSS loader, so your transpiled Sass
will be in `index.css` alongside your bundle.

In all other cases esbuild won't process the CSS content — that is handled by the plugin instead.
> If you want `url()` resolution or other processing you need to use `postcss` like in [this example](https://github.com/glromeo/esbuild-sass-plugin/issues/92#issuecomment-1219209442)

**NOTE:** Since version `2.7.0` the `css` type also works with PostCSS, CSS modules, and any transformation function
by keeping an internal cache of CSS chunks (virtual CSS files) and importing them in the module wrapping the contents.

#### `type: "local-css"`
This mode uses esbuild's built-in CSS modules support (i.e. the [`local-css` loader](https://esbuild.github.io/content-types/#local-css)).
Use this for lightweight Sass integration that leverages esbuild's [built-in CSS processing features](https://esbuild.github.io/content-types/#css):

```javascript
await esbuild.build({
  ...
  plugins: [
    sassPlugin({
      filter: /\.module\.scss$/,
      type: 'local-css'
    }),
    sassPlugin({
      filter: /\.scss$/,
      type: 'css'
    }),
  ],
  ...
})
```

#### `type: "style"`
In this mode the stylesheet will be in the JavaScript bundle
and will be dynamically added to the page when the bundle is loaded.

#### `type: "css-text"`
Use this mode to import the resulting CSS as a string:

```javascript
await esbuild.build({
  ...
  plugins: [sassPlugin({
    type: "css-text",
    ...
  })]
})
```

...and in your module do something like:

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

#### `type: "lit-css"`
Import a **lit-element** css result using `type: "lit-css"`:

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

#### `type: function`

You can provide your own module factory as type — a function that receives the CSS text and the nonce token
and returns the source content to be used in place of the import.

Look in `test/fixtures` folder for more usage examples.

### `cache`
The cache is enabled by default and can be turned off with `cache: false`.
Each plugin instance creates and maintains its own cache (as a Map) that lives for the duration of the build.
You can pass a Map to preserve the cache across subsequent builds, but sharing the same cache between different
instances may cause issues if the contents are incompatible.
> If you are unsure, keep a separate Map for each plugin instance.

### `cssImports`
When set to `true` the plugin rewrites node-modules relative URLs starting with the `~` prefix so that
esbuild can resolve them similarly to what `css-loader` does.
> Although this practice is [kind of deprecated nowadays](https://webpack.js.org/loaders/sass-loader/#resolving-import-at-rules)
> some packages still use this notation (e.g. `formio`).
> See [issue #74](https://github.com/glromeo/esbuild-sass-plugin/issues/74) for context.

### `nonce`
In the presence of Content-Security-Policy
[(CSP)](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/style-src)
the `nonce` option allows specifying a nonce attribute for dynamically generated `<style>` elements.

If the `nonce` string starts with `window`, `process`, or `globalThis` it is left unquoted in the code:
```javascript
sassPlugin({
  type: 'style',
  nonce: 'window.__esbuild_nonce__'
})
```
This allows defining it globally or leaving it for a subsequent build to resolve via [esbuild define](https://esbuild.github.io/api/#define):
```javascript
define: {'window.__esbuild_nonce__': '"12345"'}
```

### `prefer`
When specified, allows importing npm packages that have `sass` or `style` fields in `package.json`, preferring those over `main`.

> **NOTE**: This is an experimental feature
> * it replaces the internal use of `require.resolve` with browserify `resolve.sync`
> * it only applies to imports prefixed by `~`

### `importMapper`

A function to customize/re-map import paths, covering both `import` statements in JavaScript/TypeScript
and `@import` in Sass/SCSS. You can use this option to re-map import paths like tsconfig's `paths` option.

e.g. given this `tsconfig.json`:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@img/*": ["./assets/images/*"]
    }
  }
}
```

resolve these paths with `importMapper`:

```javascript
await esbuild.build({
  ...,
  plugins: [sassPlugin({
    importMapper: (path) => path.replace(/^@img\//, './assets/images/')
  })]
})
```

### `precompile`

#### Rewriting relative `url(...)`s
If your Sass references resources with relative URLs (see [#48](https://github.com/glromeo/esbuild-sass-plugin/issues/48))
esbuild will struggle to rewrite them because it has no knowledge of the imports the Sass compiler has gone through.
The importer API allows rewriting relative URLs as absolute ones, which esbuild can then handle.

Here is an example of how to do the `url(...)` rewrite ([make sure to handle `\` on Windows](https://github.com/glromeo/esbuild-sass-plugin/issues/58)):
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

#### Globals and other shims (like sass-loader's `additionalData`)
Look for a complete example in the [precompile](https://github.com/glromeo/esbuild-sass-plugin/tree/main/test/fixture/precompile) fixture.

Prepending a variable for a specific `pathname`:
```javascript
const context = { color: "blue" }

await esbuild.build({
  ...,
  plugins: [sassPlugin({
    precompile(source, pathname) {
      const prefix = /\/included\.scss$/.test(pathname)
        ? `$color: ${context.color};`
        : ''
      return prefix + source
    }
  })]
})
```

Prepending an `@import` of a globals file only for the root file (to avoid re-importing in nested files):
```javascript
await esbuild.build({
  ...,
  plugins: [sassPlugin({
    precompile(source, pathname, isRoot) {
      return isRoot ? `@import '/path/to/globals.scss';\n${source}` : source
    }
  })]
})
```

### `transform`

```typescript
async (this: SassPluginOptions, css: string, resolveDir?: string) => Promise<string>
```

A function invoked before passing the CSS to esbuild or wrapping it in a module.
It can be used to do **PostCSS** processing and/or to create **CSS modules**.

> **NOTE:** Since `v1.5.0` transform can return either a string or an esbuild `LoadResult` object.
> This is what `postcssModules` uses to pass JavaScript modules to esbuild, bypassing the plugin output altogether.

#### PostCSS

```javascript
const postcss = require('postcss')
const autoprefixer = require('autoprefixer')
const postcssPresetEnv = require('postcss-preset-env')

esbuild.build({
  ...,
  plugins: [
    sassPlugin({
      async transform(source, resolveDir) {
        const {css} = await postcss([autoprefixer, postcssPresetEnv({stage: 0})]).process(source)
        return css
      }
    })
  ]
})
```

#### CSS Modules

A helper function is available to do all the work of calling PostCSS to create a CSS module:

```javascript
const {sassPlugin, postcssModules} = require('esbuild-sass-plugin')

esbuild.build({
  ...,
  plugins: [sassPlugin({
    transform: postcssModules({
      // ...options for postcss-modules: https://github.com/madyankin/postcss-modules
    })
  })]
})
```

`postcssModules` produces JavaScript modules handled by esbuild's `js` loader.
It also accepts an optional array of PostCSS plugins as a second parameter.

Look into [fixture/css-modules](https://github.com/glromeo/esbuild-sass-plugin/tree/main/test/fixture/css-modules) for
the complete example.

> **NOTE:** `postcss` and `postcss-modules` must be added to your `package.json`.

### `namedExports`

When using `transform` (e.g. with PostCSS), this option allows named exports alongside the default export.
When set to `true`, "safe-identifiers" is used to sanitize names and ensure they are valid JS identifiers.

Any altered identifier name will be logged like:

```bash
Exported 'class-name' as 'class_name' in 'test/fixtures/named-exports/style.css'
Exported 'switch' as '_switch' in 'test/fixtures/named-exports/style.css'
```

The original name is still available on the `default` export:

```js
import style, { class_name, _switch } from './style.css'
console.log(style['class-name'] === class_name) // true
console.log(style['switch'] === _switch) // true
```

You can also supply a function to control how exported names are generated:

```js
namedExports: name => /-/.test(name) && name.replace(/-/g, '_')
```

### `quietDeps`

In order for `quietDeps` to correctly identify external dependencies, the `url` option is defaulted to the importing file path URL.

> The `url` option can cause problems when importing source Sass files from third-party modules. The best workaround is to avoid `quietDeps` and [mute the logger](https://sass-lang.com/documentation/js-api/interfaces/stringoptions/#logger) if needed.

### `silenceDeprecations`

Accepts an array of deprecation identifiers to omit from logs during a build.

### pnpm

There's a working example of using `pnpm` with `@material` design
in [issue/38](https://github.com/glromeo/esbuild-sass-plugin/tree/main/test/issues/38)

### Benchmarks
**Windows 11** Pro - **i7-490K** CPU @ **4.00**GHz - RAM **32**GB - SSD **500**GB

Given 24 × 24 = 576 lit-element files & 576 imported CSS styles plus the import of the full bootstrap 5.1

|                        | sass-embedded  | sass-embedded (no cache) | dart sass | dart sass (no cache) |
|------------------------|----------------|--------------------------|-----------|----------------------|
| **initial build**      | 731.312ms      | 779.363ms                | 2.450s    | 2.450s               |
| rebuild (.ts change)   | 170.35ms       | 188.861ms                | 179.125ms | 1.710s               |
| rebuild (.ts change)   | 155.802ms      | 167.413ms                | 176.849ms | 1.576s               |
| rebuild (.scss change) | 203.746ms      | 160.601ms                | 188.164ms | 1.575s               |
| rebuild (.scss change) | 152.733ms      | 144.754ms                | 145.835ms | 1.520s               |


[travis-url]: https://app.travis-ci.com/glromeo/esbuild-sass-plugin
[travis-image]: https://app.travis-ci.com/glromeo/esbuild-sass-plugin.svg?branch=main
