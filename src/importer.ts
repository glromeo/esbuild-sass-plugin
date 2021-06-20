import {SassPluginOptions} from "./index";
import resolve from "resolve";

export function createSassImporter({basedir = process.cwd()}: SassPluginOptions) {

    const opts = {basedir, extensions: [".scss", ".sass", ".css"]};

    return function importer(url, prev) {
        if (url.startsWith("~")) {
            url = url.slice(1);
        }
        return {file: resolve.sync(url, opts)};
    }
}
