"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sassPlugin = void 0;
const path = __importStar(require("path"));
const sass_1 = require("sass");
const cssResultModule = cssText => `\
import {css} from "lit-element";
export default css\`
${cssText.replace(/([$`\\])/g, "\\$1")}\`;
`;
const styleModule = cssText => `\
document.head
    .appendChild(document.createElement("style"))
    .appendChild(document.createTextNode(\`
${cssText.replace(/([$`\\])/g, "\\$1")}\`));
`;
function makeModule(contents, format) {
    return format === "style" ? styleModule(contents) : cssResultModule(contents);
}
function sassPlugin(options = {}) {
    return {
        name: "sass-plugin",
        setup(build) {
            build.onResolve({ filter: /\.(sass|scss)$/ }, args => {
                let paths = options.includePaths ? [args.resolveDir, ...options.includePaths] : [args.resolveDir];
                return { path: require.resolve(args.path, { paths }), namespace: "sass" };
            });
            build.onLoad({ filter: /./, namespace: "sass" }, args => {
                const { css } = sass_1.renderSync({
                    ...options,
                    file: args.path
                });
                const contents = css.toString("utf-8");
                if (options.format) {
                    return {
                        contents: makeModule(contents, options.format),
                        loader: "js",
                        resolveDir: path.dirname(args.path)
                    };
                }
                else {
                    return { contents: contents, loader: "css" };
                }
            });
        }
    };
}
exports.sassPlugin = sassPlugin;
//# sourceMappingURL=index.js.map