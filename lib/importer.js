"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSassImporter = void 0;
const resolve_1 = __importDefault(require("resolve"));
const utils_1 = require("./utils");
const path_1 = require("path");
function createSassImporter({ basedir = process.cwd() }) {
    const opts = { basedir, extensions: [".scss", ".sass", ".css"] };
    return function importer(url, prev) {
        if (url.startsWith("~")) {
            const pathname = resolve_1.default.sync(url.slice(1), opts);
            return { file: utils_1.moduleRelativeUrl(path_1.posix.dirname(prev), pathname) };
        }
        else {
            return { file: url };
        }
    };
}
exports.createSassImporter = createSassImporter;
//# sourceMappingURL=importer.js.map