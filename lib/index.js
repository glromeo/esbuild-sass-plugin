"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sassPlugin = void 0;
const fs_1 = require("fs");
const path_1 = require("path");
const picomatch_1 = __importDefault(require("picomatch"));
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
function makeModule(contents, type) {
    return type === "style" ? styleModule(contents) : cssResultModule(contents);
}
function sassPlugin(options = {}) {
    const types = !options.type
        ? null
        : typeof options.type === "string"
            ? [[options.type, path => true]]
            : typeof options.type === "object"
                ? Object.entries(options.type).map(([key, value]) => [key, picomatch_1.default(value)])
                : null;
    const typeOf = types !== null
        ? path => {
            for (const [type, accepts] of types)
                if (accepts(path)) {
                    return type;
                }
            return "css";
        }
        : path => "css";
    function caching(callback) {
        if (options.cache) {
            const cache = new Map();
            return args => {
                let { mtimeMs } = fs_1.statSync(args.path);
                let cached = cache.get(args.path);
                if (cached && cached.mtimeMs === mtimeMs) {
                    return cached.result;
                }
                else {
                    const result = callback(args);
                    cache.set(args.path, { mtimeMs, result });
                    return result;
                }
            };
        }
        return callback;
    }
    function transform(file) {
        const { css } = sass_1.renderSync({
            importer: url => ({ file: url.replace(/^~/, "node_modules/") }),
            ...options,
            file
        });
        return css.toString("utf-8");
    }
    return {
        name: "sass-plugin",
        setup(build) {
            build.onResolve({ filter: /^\.\.?\/.*\.(s[ac]ss|css)$/ }, ({ path, resolveDir }) => {
                let resolved = path_1.resolve(resolveDir, path);
                return { path: resolved, namespace: "sass" };
            });
            build.onResolve({ filter: /^([^.]|\.\.?[^/]).*\.(s[ac]ss|css)$/ }, ({ path, resolveDir }) => {
                let paths = options.includePaths ? [resolveDir, ...options.includePaths] : [resolveDir];
                let resolved = require.resolve(path, { paths });
                return { path: resolved, namespace: "sass" };
            });
            build.onLoad({ filter: /./, namespace: "sass" }, caching(({ path }) => {
                let contents = path.endsWith(".css") ? fs_1.readFileSync(path, "utf-8") : transform(path);
                let type = typeOf(path.replace(/\\/g, "/"));
                return type === "css" ? {
                    contents: contents,
                    loader: "css"
                } : {
                    contents: makeModule(contents, type),
                    loader: "js",
                    resolveDir: path_1.dirname(path)
                };
            }));
        }
    };
}
exports.sassPlugin = sassPlugin;
//# sourceMappingURL=index.js.map