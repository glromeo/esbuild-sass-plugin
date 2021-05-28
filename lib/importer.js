"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSassImporter = void 0;
const path_1 = require("path");
const fs_1 = require("fs");
const utils_1 = require("./utils");
function findModuleDirectory(basedir) {
    const root = path_1.parse(basedir).root;
    do {
        const path = path_1.join(basedir, "node_modules");
        if (fs_1.existsSync(path)) {
            return path;
        }
        else {
            basedir = path_1.dirname(basedir);
        }
    } while (basedir !== root);
}
function createSassImporter({ basedir = process.cwd() }) {
    const moduleDirectory = findModuleDirectory(basedir);
    if (!moduleDirectory) {
        console.log("unable to find 'node_modules' in: " + basedir);
    }
    return function importer(url, prev) {
        const relativeBaseUrl = utils_1.moduleRelativeUrl(path_1.posix.dirname(prev), moduleDirectory);
        return { file: url.replace(/^~/, relativeBaseUrl) };
    };
}
exports.createSassImporter = createSassImporter;
//# sourceMappingURL=importer.js.map