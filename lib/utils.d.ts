import { SassPluginOptions, Type } from "./index";
import PostcssModulesPlugin from "postcss-modules";
import { OnLoadResult } from "esbuild";
export declare function loadSass({ implementation: module, includePaths }: SassPluginOptions): any;
export declare function makeModule(contents: string, type: Type): string;
export declare function postcssModules(options: Parameters<PostcssModulesPlugin>[0] & {
    basedir?: string;
    includePaths?: string[] | undefined;
}): (source: string, dirname: string, path: string) => Promise<OnLoadResult>;
