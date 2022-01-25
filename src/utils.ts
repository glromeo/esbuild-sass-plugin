import {Type} from './index'
import {AcceptedPlugin, Postcss} from 'postcss'
import PostcssModulesPlugin from 'postcss-modules'
import {BuildOptions, OnLoadResult} from 'esbuild'
import {Syntax} from 'sass'
import {parse, resolve} from 'path'
import {existsSync} from 'fs'

export const RELATIVE_PATH = /^\.\.?\//

export function modulesPaths(): string[] {
  let path = process.cwd()
  let {root} = parse(path)
  let found: string[] = []
  while (path !== root) {
    const filename = resolve(path, 'node_modules')
    if (existsSync(filename)) {
      found.push(filename)
    }
    path = resolve(path, '..')
  }
  return [...found]
}

export function fileSyntax(filename: string): Syntax {
  if (filename.endsWith('.scss')) {
    return 'scss'
  } else if (filename.endsWith('.css')) {
    return 'css'
  } else {
    return 'indented'
  }
}

export type PluginContext = {
  instance: number
  namespace: string
  sourcemap: boolean
  watched: { [path: string]: string[] } | null
}

const SASS_PLUGIN_CONTEXT = Symbol()

export function getContext(buildOptions: BuildOptions): PluginContext {
  let descriptor = Object.getOwnPropertyDescriptor(buildOptions, SASS_PLUGIN_CONTEXT)
  if (descriptor === undefined) {
    Object.defineProperty(buildOptions, SASS_PLUGIN_CONTEXT, descriptor = {
      value: {
        instances: 0
      }
    })
  }
  const instance = descriptor.value.instances++
  return {
    instance,
    namespace: `sass-plugin-${instance}`,
    sourcemap: !!buildOptions.sourcemap,
    watched: buildOptions.watch ? {} : null
  }
}

export function sourceMappingURL(sourceMap: any): string {
  const data = Buffer.from(JSON.stringify(sourceMap), 'utf-8').toString('base64')
  return `/*# sourceMappingURL=data:application/json;charset=utf-8;base64,${data} */`
}

function requireTool(module: string, basedir?: string) {
  try {
    return require(module)
  } catch (ignored) {
  }
  if (basedir) try {
    return require(require.resolve(module, {paths: [basedir]}))
  } catch (ignored) {
  }
  try {
    return require(require.resolve(module, {paths: [process.cwd()]}))
  } catch (e) {
    try {
      return require(module) // extra attempt at finding a co-located tool
    } catch (ignored) {
      console.error(`Cannot find module '${module}', make sure it's installed. e.g. yarn add -D ${module}`, e)
      process.exit(1)
    }
  }
}

const cssTextModule = cssText => `\
export default \`
${cssText.replace(/([$`\\])/g, '\\$1')}\`;
`

const cssResultModule = cssText => `\
import {css} from "lit-element/lit-element.js";
export default css\`
${cssText.replace(/([$`\\])/g, '\\$1')}\`;
`

const styleModule = cssText => `\
const css = \`${cssText.replace(/([$`\\])/g, '\\$1')}\`;
document.head
    .appendChild(document.createElement("style"))
    .appendChild(document.createTextNode(css));
export {css};
`

export function makeModule(contents: string, type: Type) {
  if (type === 'style') {
    return styleModule(contents)
  } else {
    return type === 'lit-css' ? cssResultModule(contents) : cssTextModule(contents)
  }
}

export type PostcssModulesParams = Parameters<PostcssModulesPlugin>[0] & {
  basedir?: string
};

export function postcssModules(options: PostcssModulesParams, plugins: AcceptedPlugin[] = []) {

  const postcss: Postcss = requireTool('postcss', options.basedir)
  const postcssModulesPlugin: PostcssModulesPlugin = requireTool('postcss-modules', options.basedir)

  return async (source: string, dirname: string, path: string): Promise<OnLoadResult> => {

    let cssModule

    const {css} = await postcss([
      postcssModulesPlugin({
        ...options,
        getJSON(cssFilename: string, json: { [name: string]: string }): void {
          cssModule = JSON.stringify(json, null, 2)
        }
      }),
      ...plugins
    ]).process(source, {from: path, map: false})

    return {
      contents: `${makeModule(css, 'style')}export default ${cssModule};`,
      loader: 'js'
    }
  }
}
