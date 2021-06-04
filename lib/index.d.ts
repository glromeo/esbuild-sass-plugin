import { OnLoadResult } from "esbuild";
import { Importer, types } from "sass";
export declare type Type = "css" | "style" | "css-text" | "lit-css";
export declare type SassPluginOptions = {
    exclude?: RegExp;
    implementation?: string;
    basedir?: string;
    type?: Type | ([Type] | [Type, string | [string] | [string, string]])[];
    cache?: Map<string, Map<string, CachedResult>> | boolean;
    picomatch?: any;
    importer?: Importer | Importer[];
    functions?: {
        [key: string]: (...args: types.SassType[]) => types.SassType | void;
    };
    includePaths?: string[];
    indentedSyntax?: boolean;
    indentType?: "space" | "tab";
    indentWidth?: number;
    linefeed?: "cr" | "crlf" | "lf" | "lfcr";
    outputStyle?: "compressed" | "expanded";
    sourceMap?: boolean | string;
    sourceMapContents?: boolean;
    sourceMapEmbed?: boolean;
    sourceMapRoot?: string;
    transform?: (css: string, resolveDir: string) => string | Promise<string>;
};
export declare type CachedResult = {
    type: string;
    mtimeMs: number;
    result: OnLoadResult;
};
export { sassPlugin } from "./plugin";
