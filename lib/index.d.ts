import { Plugin } from "esbuild";
import * as sass from "sass";
export declare type SassPluginOptions = sass.Options & {
    basedir?: string;
    type?: string | ([string] | [string, string | [string] | [string, string]])[];
    cache?: boolean;
    picomatch?: any;
};
export declare function sassPlugin(options?: SassPluginOptions): Plugin;
