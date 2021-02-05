import { Plugin } from "esbuild";
import { Options } from "sass";
export declare type SassPluginOptions = Options & {
    basedir?: string;
    type?: string | Record<string, string[]>;
    cache?: boolean;
};
export declare function sassPlugin(options?: SassPluginOptions): Plugin;
