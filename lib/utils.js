"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postcssModules = exports.makeModule = exports.loadSass = void 0;
function requireModule(module, includePaths) {
    try {
        return require(require.resolve(module, includePaths ? { paths: includePaths } : { paths: [process.cwd()] }));
    }
    catch (e) {
        try {
            return require(module);
        }
        catch (ignored) {
            console.error(`Cannot find module '${module}', make sure it's installed. e.g. yarn add -D ${module}`, e);
            process.exit(1);
        }
    }
}
function requireConfig(pathname, includePaths) {
    try {
        return require(require.resolve(pathname, includePaths ? { paths: includePaths } : { paths: [process.cwd()] }));
    }
    catch (e) {
        return null;
    }
}
function loadSass({ implementation: module = "sass", includePaths }) {
    return requireModule(module, includePaths);
}
exports.loadSass = loadSass;
const cssTextModule = cssText => `\
export default \`
${cssText.replace(/([$`\\])/g, "\\$1")}\`;
`;
const cssResultModule = cssText => `\
import {css} from "lit-element/lit-element.js";
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
    var _a, _b, _c;
    const includePaths = (_a = options.includePaths) !== null && _a !== void 0 ? _a : [(_b = options.basedir) !== null && _b !== void 0 ? _b : process.cwd()];
    const postcss = requireModule("postcss", includePaths);
    const postcssConfig = (_c = requireConfig("./postcss.config.js", includePaths)) !== null && _c !== void 0 ? _c : {};
    const postcssModulesPlugin = requireModule("postcss-modules", includePaths);
    return async (source, dirname, path) => {
        var _a;
        let cssModule;
        let postcssOptions = {
            ...postcssConfig,
            plugins: [
                postcssModulesPlugin({
                    ...options,
                    getJSON(cssFilename, json) {
                        cssModule = JSON.stringify(json, null, 2);
                    }
                }),
                ...((_a = postcssConfig.plugins) !== null && _a !== void 0 ? _a : [])
            ]
        };
        const { css } = await postcss(postcssOptions).process(source, { from: undefined, map: false });
        return {
            contents: `${makeModule(css, "style")}export default ${cssModule};`,
            loader: "js"
        };
    };
}
exports.postcssModules = postcssModules;
//# sourceMappingURL=utils.js.map