"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sassPlugin = void 0;
const fs_1 = require("fs");
const path_1 = require("path");
const picomatch_1 = __importDefault(require("picomatch"));
const utils_1 = require("./utils");
const importer_1 = require("./importer");
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
document.head
    .appendChild(document.createElement("style"))
    .appendChild(document.createTextNode(\`
${cssText.replace(/([$`\\])/g, "\\$1")}\`));
`;
function makeModule(contents, type) {
    if (type === "style") {
        return styleModule(contents);
    }
    else {
        return type === "lit-css" ? cssResultModule(contents) : cssTextModule(contents);
    }
}
function sassPlugin(options = {}) {
    if (!options.basedir) {
        options.basedir = process.cwd();
    }
    if (!options.picomatch) {
        options.picomatch = { unixify: true };
    }
    const sass = utils_1.loadSass(options);
    const type = typeof options.type === "string" ? options.type : "css";
    const matchers = Array.isArray(options.type)
        && options.type.map(function ([type, pattern]) {
            if (Array.isArray(pattern)) {
                const importerMatcher = picomatch_1.default("**/" + pattern[0], options.picomatch);
                const pathMatcher = pattern[1] ? picomatch_1.default("**/" + pattern[1], options.picomatch) : null;
                if (pathMatcher) {
                    return [
                        type, (args) => importerMatcher(args.importer) && pathMatcher(path_1.resolve(args.resolveDir, args.path))
                    ];
                }
                else {
                    return [
                        type, (args) => importerMatcher(args.importer)
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
    function pathResolve({ resolveDir, path, importer }) {
        return path_1.resolve(resolveDir || path_1.dirname(importer), path);
    }
    function requireResolve({ resolveDir, path, importer }) {
        if (!resolveDir) {
            resolveDir = path_1.dirname(importer);
        }
        const paths = options.includePaths ? [resolveDir, ...options.includePaths] : [resolveDir];
        return require.resolve(path, { paths });
    }
    function readCssFileSync(path) {
        return { css: fs_1.readFileSync(path, "utf-8"), watchFiles: [path] };
    }
    const importer = importer_1.createSassImporter(options);
    function renderSync(file) {
        const { css, stats: { includedFiles } } = sass.renderSync({ importer, ...options, file });
        return {
            css: css.toString("utf-8"),
            watchFiles: includedFiles
        };
    }
    const cache = !options.cache
        ? null
        : options.cache instanceof Map
            ? options.cache
            : new Map();
    return {
        name: "sass-plugin",
        setup: function (build) {
            build.onResolve({ filter: /\.(s[ac]ss|css)$/ }, (args) => {
                return { path: args.path, namespace: "sass", pluginData: args };
            });
            let cached;
            if (cache) {
                cached = (resolve, transform) => async ({ pluginData: args }) => {
                    let group = cache.get(args.resolveDir);
                    if (!group) {
                        group = new Map();
                        cache.set(args.resolveDir, group);
                    }
                    let cached = group.get(args.path);
                    if (cached) {
                        let watchFiles = cached.result.watchFiles;
                        let stats = await Promise.all(watchFiles.map(filename => fs_1.promises.stat(filename)));
                        for (const { mtimeMs } of stats) {
                            if (mtimeMs > cached.mtimeMs) {
                                let mtimeMs = Date.now();
                                cached.result = await transform(watchFiles[0], cached.type);
                                cached.mtimeMs = mtimeMs;
                                break;
                            }
                        }
                        return cached.result;
                    }
                    let filename = resolve(args);
                    let type = typeOf(args);
                    let mtimeMs = Date.now();
                    let result = await transform(filename, type);
                    group.set(args.path, {
                        type,
                        mtimeMs: mtimeMs,
                        result
                    });
                    return result;
                };
            }
            else {
                cached = (resolve, transform) => ({ pluginData: args }) => {
                    return transform(resolve(args), typeOf(args));
                };
            }
            async function transform(path, type) {
                let { css, watchFiles } = path.endsWith(".css") ? readCssFileSync(path) : renderSync(path);
                if (options.transform) {
                    css = await options.transform(css, path_1.dirname(path));
                }
                return type === "css" ? {
                    contents: css,
                    loader: "css",
                    resolveDir: path_1.dirname(path),
                    watchFiles
                } : {
                    contents: makeModule(css, type),
                    loader: "js",
                    resolveDir: path_1.dirname(path),
                    watchFiles
                };
            }
            build.onLoad({ filter: /^\.\.?\//, namespace: "sass" }, cached(pathResolve, transform));
            build.onLoad({ filter: /^([^.]|\.\.?[^/])/, namespace: "sass" }, cached(requireResolve, transform));
        }
    };
}
exports.sassPlugin = sassPlugin;
//# sourceMappingURL=plugin.js.map