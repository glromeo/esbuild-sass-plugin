import {SassPluginOptions} from "./index";
import resolve from "resolve";

export function createSassImporter({basedir = process.cwd(), importMapper }: SassPluginOptions) {

    const opts = {basedir, extensions: [".scss", ".sass", ".css"]};

    return function importer(url) {
        if (url.startsWith("~")) {
            url = url.slice(1);
        }
        if (importMapper) {
            url = importMapper(url)
        }
        try {
            return {file: resolve.sync(url, opts)};
        } catch (e) {
            const index = url.lastIndexOf("/");
            const fragment = url.slice(0, index)+"/_"+url.slice(index+1)
            return {file: resolve.sync(fragment, opts)};
        }
    }
}
