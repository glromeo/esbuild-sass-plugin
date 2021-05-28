import {SassPluginOptions} from "./index";
import {dirname, join, parse, posix} from "path";
import {existsSync} from "fs";
import {moduleRelativeUrl} from "./utils";

function findModuleDirectory(basedir: string) {
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

export function createSassImporter({basedir = process.cwd()}: SassPluginOptions) {

    const moduleDirectory = findModuleDirectory(basedir);
    if (!moduleDirectory) {
        console.log("unable to find 'node_modules' in: " + basedir);
    }

    return function importer(url, prev) {
        const relativeBaseUrl = moduleRelativeUrl(posix.dirname(prev), moduleDirectory);
        return {file: url.replace(/^~/, relativeBaseUrl!)};
    }
}