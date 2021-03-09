"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.moduleRelativeUrl = exports.findModuleDirectory = exports.loadSass = void 0;
const fs_1 = require("fs");
const path_1 = require("path");
function loadSass({ implementation: module = "sass", basedir = process.cwd() }) {
    try {
        return require(require.resolve(module, { paths: [basedir] }));
    }
    catch (e) {
        console.error(`Cannot find module '${module}', make sure it's installed. e.g. yarn add -D ${module}`);
        process.exit(1);
    }
}
exports.loadSass = loadSass;
function findModuleDirectory({ basedir = process.cwd() }) {
    do {
        const path = path_1.join(basedir, "node_modules");
        if (fs_1.existsSync(path)) {
            return path;
        }
        else {
            basedir = path_1.dirname(basedir);
        }
    } while (basedir !== "/");
}
exports.findModuleDirectory = findModuleDirectory;
function moduleRelativeUrl(basedir, pathname) {
    let url = path_1.relative(basedir, pathname).replace(/\\/g, "/");
    return /^\.\.?\//.test(url) ? `${url}/` : `./${url}/`;
}
exports.moduleRelativeUrl = moduleRelativeUrl;
//# sourceMappingURL=utils.js.map