import { SassPluginOptions } from "./index";
export declare function createSassImporter({ basedir, importMapper, implementation }: SassPluginOptions): (url: any) => {
    file: string;
} | null;
