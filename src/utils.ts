import {SassPluginOptions, Type} from "./index";
import {Postcss} from "postcss";
import PostcssModulesPlugin from "postcss-modules";
import {OnLoadResult} from "esbuild";

function requireModule(module: string, includePaths: string[] | undefined) {
    try {
        return require(require.resolve(module, includePaths ? {paths: includePaths} : {paths: [process.cwd()]}));
    } catch (e) {
        try {
            return require(module); // extra attempt at finding a co-located tool
        } catch (ignored) {
        }
        console.error(`Cannot find module '${module}', make sure it's installed. e.g. yarn add -D ${module}`, e);
        process.exit(1);
    }
}

export function loadSass({implementation: module = "sass", includePaths}: SassPluginOptions) {
    return requireModule(module, includePaths);
}

const cssTextModule = cssText => `\
export default \`
${cssText.replace(/([$`\\])/g, "\\$1")}\`;
`;

const cssResultModule = cssText => `\
import {css} from "lit-element";
export default css\`
${cssText.replace(/([$`\\])/g, "\\$1")}\`;
`;

const styleModule = cssText => `\
const css = \`${cssText.replace(/([$`\\])/g, "\\$1")}\`;
document.head
    .appendChild(document.createElement("style"))
    .appendChild(document.createTextNode(css));
export {css};
`;

export function makeModule(contents: string, type: Type) {
    if (type === "style") {
        return styleModule(contents);
    } else {
        return type === "lit-css" ? cssResultModule(contents) : cssTextModule(contents);
    }
}

export function postcssModules(options: Parameters<PostcssModulesPlugin>[0] & { basedir?: string, includePaths?: string[] | undefined }) {

    const includePaths = options.includePaths ?? [options.basedir ?? process.cwd()];
    const postcss: Postcss = requireModule("postcss", includePaths);
    const postcssModulesPlugin: PostcssModulesPlugin = requireModule("postcss-modules", includePaths);

    return async (source: string, dirname: string, path: string): Promise<OnLoadResult> => {

        let cssModule;

        const {css} = await postcss([postcssModulesPlugin({
            ...options,
            getJSON(cssFilename: string, json: { [name: string]: string }): void {
                cssModule = JSON.stringify(json, null, 2);
            }
        })]).process(source, {from: undefined, map: false});

        return {
            contents: `${makeModule(css, "style")}export default ${cssModule};`,
            loader: "js"
        };
    };
}

