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
exports.createSassImporter = void 0;
const fs = __importStar(require("fs"));
const url_1 = require("url");
const path_1 = require("path");
function createSassImporter({ basedir = process.cwd(), importMapper }) {
    const opts = { basedir, extensions: [".scss", ".sass", ".css"] };
    return (basepath) => ({
        load(canonicalUrl) {
            return { contents: fs.readFileSync(canonicalUrl.pathname.slice(1), "utf8"), syntax: "scss" };
        },
        canonicalize(url, options) {
            if (importMapper) {
                url = importMapper(url);
            }
            else {
                if (url.startsWith("~")) {
                    url = url.slice(1);
                    url = require.resolve(url, { paths: [(0, path_1.dirname)(basepath)] });
                }
                else if (url.startsWith("file://")) {
                    url = url.slice(8);
                }
            }
            try {
                return (0, url_1.pathToFileURL)(require.resolve(url, { paths: [(0, path_1.dirname)(basepath)] }));
            }
            catch (e) {
                try {
                    const index = url.lastIndexOf("/");
                    const fragment = (index >= 0 ? url.slice(0, index) + "/_" + url.slice(index + 1) : "_" + url) + ".scss";
                    let path = (0, path_1.resolve)((0, path_1.dirname)(basepath), fragment);
                    return (0, url_1.pathToFileURL)(require.resolve(path, { paths: [(0, path_1.dirname)(basepath)] }));
                }
                catch (e) {
                    return null;
                }
            }
        }
    });
}
exports.createSassImporter = createSassImporter;
//# sourceMappingURL=importer.js.map