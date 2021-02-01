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
function sassPlugin(options) {
    const sassOption = {};
    return {
        name: "sass-plugin",
        setup(build) {
            build.onResolve({ filter: /\.(sass|scss)$/ }, args => {
                return { path: path.resolve(args.resolveDir, args.path), namespace: "sass" };
            });
            build.onLoad({ filter: /./, namespace: "sass" }, args => {
                const { css } = sass_1.renderSync({
                    ...sassOption,
                    file: args.path
                });
                const contents = css.toString("utf-8");
                return { contents: contents, loader: "css" };
            });
        }
    };
}
exports.sassPlugin = sassPlugin;
//# sourceMappingURL=index.js.map