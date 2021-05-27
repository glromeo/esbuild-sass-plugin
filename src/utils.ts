import {existsSync} from "fs";
import {dirname, join, relative, parse} from "path";
import {SassPluginOptions} from "./index";

export function loadSass({implementation: module = "sass", basedir = process.cwd()}: SassPluginOptions) {
    try {
        return require(require.resolve(module, {paths: [basedir]}));
    } catch (e) {
        console.error(`Cannot find module '${module}', make sure it's installed. e.g. yarn add -D ${module}`)
        process.exit(1);
    }
}

export function findModuleDirectory({basedir = process.cwd()}: SassPluginOptions) {
    const root = parse(basedir).root;
    do {
        const path = join(basedir, "node_modules");
        if (existsSync(path)) {
            return path;
        } else {
            basedir = dirname(basedir);
        }
    } while (basedir !== root);
}

export function moduleRelativeUrl(basedir, pathname) {
    let url = relative(basedir, pathname).replace(/\\/g, "/");
    return /^\.\.?\//.test(url) ? `${url}/` : `./${url}/`;
}

