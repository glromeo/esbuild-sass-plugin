"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postcssModules = exports.makeModule = exports.loadSass = void 0;
function requireModule(module, basedir = process.cwd()) {
    try {
        return require(require.resolve(module, { paths: [basedir] }));
    }
    catch (e) {
        console.error(`Cannot find module '${module}', make sure it's installed. e.g. yarn add -D ${module}`, e);
        process.exit(1);
    }
}
function loadSass({ implementation: module = "sass", basedir = process.cwd() }) {
    return requireModule(module, basedir);
}
exports.loadSass = loadSass;
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
function makeModule(contents, type) {
    if (type === "style") {
        return styleModule(contents);
    }
    else {
        return type === "lit-css" ? cssResultModule(contents) : cssTextModule(contents);
    }
}
exports.makeModule = makeModule;
function postcssModules(options) {
    const postcss = requireModule("postcss", options.basedir);
    const postcssModulesPlugin = requireModule("postcss-modules", options.basedir);
    return async (source, dirname, path) => {
        let cssModule;
        const { css } = await postcss([postcssModulesPlugin({
                ...options,
                getJSON(cssFilename, json) {
                    cssModule = JSON.stringify(json, null, 2);
                }
            })]).process(source, { from: undefined, map: false });
        return {
            contents: `${makeModule(css, "style")}export default ${cssModule};`,
            loader: "js"
        };
    };
}
exports.postcssModules = postcssModules;
//# sourceMappingURL=utils.js.map