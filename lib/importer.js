"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSassImporter = void 0;
const resolve_1 = __importDefault(require("resolve"));
function createSassImporter({ basedir = process.cwd() }) {
    const opts = { basedir, extensions: [".scss", ".sass", ".css"] };
    return function importer(url, prev) {
        if (url.startsWith("~")) {
            url = url.slice(1);
        }
        try {
            return { file: resolve_1.default.sync(url, opts) };
        }
        catch (e) {
            const index = url.lastIndexOf("/");
            const fragment = url.slice(0, index) + "/_" + url.slice(index + 1);
            return { file: resolve_1.default.sync(fragment, opts) };
        }
    };
}
exports.createSassImporter = createSassImporter;
//# sourceMappingURL=importer.js.map