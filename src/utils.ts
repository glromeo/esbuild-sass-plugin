import {existsSync} from "fs";
import {dirname, join, relative} from "path";
import {Index} from "./index";

export function loadSass({implementation: module = "sass", basedir = process.cwd()}: Index) {
    try {
        return require(require.resolve(module, {paths: [basedir]}));
    } catch (e) {
        console.error(`Cannot find module '${module}', make sure it's installed. e.g. yarn add -D ${module}`)
        process.exit(1);
    }
}

export function findModuleDirectory({basedir = process.cwd()}: Index) {
    do {
        const path = join(basedir, "node_modules");
        if (existsSync(path)) {
            return path;
        } else {
            basedir = dirname(basedir);
        }
    } while (basedir !== "/");
}

export function moduleRelativeUrl(basedir, pathname) {
    let url = relative(basedir, pathname).replace(/\\/g, "/");
    return /^\.\.?\//.test(url) ? `${url}/` : `./${url}/`;
}

