import {SassPluginOptions} from "./index";
import {Importer, ImporterResult, PromiseOr} from "sass";
import * as fs from "fs";
import {pathToFileURL} from "url";
import {resolve, dirname} from "path";

export function createSassImporter({
                                       basedir = process.cwd(),
                                       importMapper
                                   }: SassPluginOptions, basepath: string): Importer {

    const opts = {basedir, extensions: [".scss", ".sass", ".css"]};

    return {
        load(canonicalUrl: URL): PromiseOr<ImporterResult | null, "sync" | "async"> {
            //console.log("canonicalUrl:", canonicalUrl);
            return {contents: fs.readFileSync(canonicalUrl.pathname.slice(1), "utf8"), syntax: "scss"};
        },
        canonicalize(url: string, options: { fromImport: boolean }): PromiseOr<URL | null, "sync" | "async"> {
            if (importMapper) {
                url = importMapper(url)
            } else {
                if (url.startsWith("~")) {
                    url = url.slice(1);
                    url = require.resolve(url, {paths: [dirname(basepath)]})
                } else if (url.startsWith("file://")) {
                    url = url.slice(8);
                }
            }
            try {
                return pathToFileURL(require.resolve(url, {paths: [dirname(basepath)]}));
            } catch (e) {
                try {
                    const index = url.lastIndexOf("/");
                    const fragment = (index >= 0 ? url.slice(0, index) + "/_" + url.slice(index + 1) : "_" + url) + ".scss"
                    let path = resolve(dirname(basepath), fragment);
                    return pathToFileURL(require.resolve(path, {paths: [dirname(basepath)]}));
                } catch (e: any) {
                    return null;
                }
            }
        }
    }
}
