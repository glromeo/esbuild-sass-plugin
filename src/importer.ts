import {SassPluginOptions} from "./index";
import resolve from "resolve";
import {moduleRelativeUrl} from "./utils";
import {posix} from "path";

export function createSassImporter({basedir = process.cwd()}: SassPluginOptions) {

    const opts = {basedir, extensions: [".scss", ".sass", ".css"]};

    return function importer(url, prev) {
        if (url.startsWith("~")) {
            const pathname = resolve.sync(url.slice(1), opts);
            return {file: moduleRelativeUrl(posix.dirname(prev), pathname)};
        } else {
            return {file: url};
        }
    }
}