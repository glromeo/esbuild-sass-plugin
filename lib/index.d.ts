import { Plugin } from "esbuild";
import { Options } from "sass";
export declare type SassPluginOptions = Options & {
    format?: "lit-css" | "style" | undefined;
};
export declare function sassPlugin(options?: SassPluginOptions): Plugin;
