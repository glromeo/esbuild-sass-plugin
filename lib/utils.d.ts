import { SassPluginOptions, Type } from "./index";
import { AcceptedPlugin } from "postcss";
import PostcssModulesPlugin from "postcss-modules";
import { OnLoadResult } from "esbuild";
export declare function loadSass({ implementation: module, includePaths }: SassPluginOptions): any;
export declare function makeModule(contents: string, type: Type): string;
export declare type PostcssModulesParams = Parameters<PostcssModulesPlugin>[0] & {
    basedir?: string;
    includePaths?: string[] | undefined;
};
export declare function postcssModules(options: PostcssModulesParams, plugins?: AcceptedPlugin[]): (source: string, dirname: string, path: string) => Promise<OnLoadResult>;
