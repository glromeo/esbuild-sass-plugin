import { SassPluginOptions } from "./index";
export declare function createSassImporter({ basedir, importMapper }: SassPluginOptions): (url: any) => {
    file: string;
};
