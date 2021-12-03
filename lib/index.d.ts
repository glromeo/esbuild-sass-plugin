import { OnLoadResult, OnResolveArgs } from "esbuild";
import { Importer, types } from "sass";
export declare type Type = "css" | "style" | "css-text" | "lit-css";
export declare type SassPluginOptions = {
    importMapper?: (url: string) => string;
    exclude?: RegExp | ((args: OnResolveArgs) => boolean) | {
        path?: RegExp;
        resolveDir?: RegExp;
    };
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
    transform?: (css: string, resolveDir: string, filePath: string) => string | OnLoadResult | Promise<string | OnLoadResult>;
    quietDeps?: boolean;
};
export declare type CachedResult = {
    type: Type;
    mtimeMs: number;
    result: OnLoadResult;
};
import { sassPlugin } from "./plugin";
export default sassPlugin;
export { sassPlugin };
export { makeModule, postcssModules } from "./utils";
