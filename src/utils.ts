import {relative} from "path";
import {SassPluginOptions} from "./index";

export function loadSass({implementation: module = "sass", basedir = process.cwd()}: SassPluginOptions) {
    try {
        return require(require.resolve(module, {paths: [basedir]}));
    } catch (e) {
        console.error(`Cannot find module '${module}', make sure it's installed. e.g. yarn add -D ${module}`)
        process.exit(1);
    }
}

export function moduleRelativeUrl(basedir, pathname) {
    let url = relative(basedir, pathname).replace(/\\/g, "/");
    return /^\.\.?\//.test(url) ? url : `./${url}`;
}

