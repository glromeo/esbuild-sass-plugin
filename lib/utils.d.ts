import { SassPluginOptions } from "./index";
export declare function loadSass({ implementation: module, basedir }: SassPluginOptions): any;
export declare function findModuleDirectory({ basedir }: SassPluginOptions): string | undefined;
export declare function moduleRelativeUrl(basedir: any, pathname: any): string;
