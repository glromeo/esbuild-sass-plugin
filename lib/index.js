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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sassPlugin = void 0;
const fs_1 = require("fs");
const path_1 = require("path");
const picomatch_1 = __importDefault(require("picomatch"));
const sass = __importStar(require("sass"));
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
    if (!options.picomatch) {
        options.picomatch = {
            unixify: true
        };
    }
    const type = typeof options.type === "string" ? options.type : "css";
    const matchers = Array.isArray(options.type)
        && options.type.map(function ([type, pattern]) {
            if (Array.isArray(pattern)) {
                const importerMatcher = picomatch_1.default("**/" + pattern[0], options.picomatch);
                const pathMatcher = pattern[1] ? picomatch_1.default("**/" + pattern[1], options.picomatch) : null;
                if (pathMatcher) {
                    return [
                        type,
                        (args) => importerMatcher(args.importer) && pathMatcher(path_1.resolve(args.resolveDir, args.path))
                    ];
                }
                else {
                    return [
                        type,
                        (args) => importerMatcher(args.importer)
                    ];
                }
            }
            else {
                if (pattern) {
                    const pathMatcher = picomatch_1.default("**/" + pattern, options.picomatch);
                    return [type, (args) => pathMatcher(path_1.resolve(args.resolveDir, args.path))];
                }
                else {
                    return [type, () => true];
                }
            }
        });
    const typeOf = matchers
        ? (args) => {
            for (const [type, isMatch] of matchers)
                if (isMatch(args)) {
                    return type;
                }
            return type;
        }
        : () => type;
    function pathResolve({ resolveDir, path }) {
        return path_1.resolve(resolveDir, path);
    }
    function requireResolve({ resolveDir, path }) {
        const paths = options.includePaths ? [resolveDir, ...options.includePaths] : [resolveDir];
        return require.resolve(path, { paths });
    }
    function renderSync(file) {
        const { css } = sass.renderSync({
            importer: url => ({ file: url.replace(/^~/, "node_modules/") }),
            ...options,
            file
        });
        return css.toString("utf-8");
    }
    return {
        name: "sass-plugin",
        setup: function (build) {
            build.onResolve({ filter: /\.(s[ac]ss|css)$/ }, (args) => {
                return { path: args.path, namespace: "sass", pluginData: args };
            });
            let cached;
            if (options.cache !== false) {
                const cache = new Map();
                cached = (resolve, transform) => ({ pluginData: args }) => {
                    let group = cache.get(args.resolveDir);
                    if (!group) {
                        group = new Map();
                        cache.set(args.resolveDir, group);
                    }
                    let cached = group.get(args.path);
                    if (cached) {
                        let { filename, mtimeMs, result } = cached;
                        let stats = fs_1.statSync(filename);
                        if (stats.mtimeMs <= mtimeMs) {
                            return cached.result;
                        }
                        cached.result = transform(filename, cached.type);
                        return result;
                    }
                    else {
                    }
                    let filename = resolve(args);
                    let type = typeOf(args);
                    let result = transform(filename, type);
                    let { mtimeMs } = fs_1.statSync(filename);
                    group.set(args.path, { filename, type, mtimeMs, result });
                    return result;
                };
            }
            else {
                cached = (resolve, transform) => ({ pluginData: args }) => {
                    return transform(resolve(args), typeOf(args));
                };
            }
            function transform(path, type) {
                let contents = path.endsWith(".css") ? fs_1.readFileSync(path, "utf-8") : renderSync(path);
                return type === "css" ? {
                    contents: contents,
                    loader: "css"
                } : {
                    contents: makeModule(contents, type),
                    loader: "js",
                    resolveDir: path_1.dirname(path)
                };
            }
            build.onLoad({ filter: /^\.\.?\//, namespace: "sass" }, cached(pathResolve, transform));
            build.onLoad({ filter: /^([^.]|\.\.?[^/])/, namespace: "sass" }, cached(requireResolve, transform));
        }
    };
}
exports.sassPlugin = sassPlugin;
//# sourceMappingURL=index.js.map