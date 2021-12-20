import {OnLoadResult} from "esbuild"
import {Importer, Value} from "sass"
import {sassPlugin} from "./plugin"

export type Type = "css" | "style" | "css-text" | "lit-css"

export type SassPluginOptions = {

  /**
   *
   */
  filter?: RegExp

  /**
   * Function to transform import path. Not just paths by @import
   * directive, but also paths imported by ts code.
   */
  importMapper?: (url: string) => string

  /**
   * "sass" for dart-sass (compiled to javascript, slow) or "node-sass" (libsass, fast yet deprecated)
   * You can pass the module name of any other implementation as long as it is API compatible
   *
   * @default "sass"
   */
  implementation?: string

  /**
   * Directory that paths will be relative to.
   *
   * @default process.cwd()
   */
  basedir?: string

  /**
   * Type of module wrapper to use
   *
   * @default css files will be passed to css loader
   */
  type?: Type

  /**
   * Enable the cache or pass your own Map to recycle its contents although
   * it's advisable to use esbuild incremental or watch for repeated builds
   *
   * @default true
   */
  cache?: Map<string, Map<string, CachedResult>> | boolean

  /**
   * Handles when the @import directive is encountered.
   *
   * A custom importer allows extension of the sass engine in both a synchronous and asynchronous manner.
   *
   * @default undefined
   */
  importer?: Importer | Importer[];

  /**
   * Holds a collection of custom functions that may be invoked by the sass files being compiled.
   *
   * @default undefined
   */
  functions?: { [key: string]: (...args: Value[]) => Value | void };

  /**
   * An array of paths that should be looked in to attempt to resolve your @import declarations.
   * When using `data`, it is recommended that you use this.
   *
   * @default []
   */
  includePaths?: string[];

  /**
   * Enable Sass Indented Syntax for parsing the data string or file.
   *
   * @default false
   */
  indentedSyntax?: boolean;

  /**
   * Used to determine whether to use space or tab character for indentation.
   *
   * @default 'space'
   */
  indentType?: "space" | "tab";

  /**
   * Used to determine the number of spaces or tabs to be used for indentation.
   *
   * @default 2
   */
  indentWidth?: number;

  /**
   * Used to determine which sequence to use for line breaks.
   *
   * @default 'lf'
   */
  linefeed?: "cr" | "crlf" | "lf" | "lfcr";

  /**
   * Determines the output format of the final CSS style.
   *
   * @default 'expanded'
   */
  outputStyle?: "compressed" | "expanded";

  /**
   * Enables the outputting of a source map.
   *
   * @default undefined
   */
  sourceMap?: boolean | string;

  /**
   * Includes the contents in the source map information.
   *
   * @default false
   */
  sourceMapContents?: boolean;

  /**
   * Embeds the source map as a data URI.
   *
   * @default false
   */
  sourceMapEmbed?: boolean;

  /**
   * The value will be emitted as `sourceRoot` in the source map information.
   *
   * @default undefined
   */
  sourceMapRoot?: string;

  /**
   * A function which will post process the css file before wrapping it in a module
   *
   * @default undefined
   */
  transform?: (css: string, resolveDir: string, filePath: string) => string | OnLoadResult | Promise<string | OnLoadResult>;

  /**
   *
   */
  quietDeps?: boolean

  /**
   *
   */
  precompile?: (source: string, path: string) => string
}

export default sassPlugin
export {sassPlugin}
export {makeModule, postcssModules} from "./utils";

export type CachedResult = {
  mtimeMs: number
  result: OnLoadResult
}