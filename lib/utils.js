"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadSass = void 0;
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
//# sourceMappingURL=utils.js.map