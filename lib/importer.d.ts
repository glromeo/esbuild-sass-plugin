import { SassPluginOptions } from "./index";
import { Importer } from "sass";
export declare function createSassImporter({ basedir, importMapper }: SassPluginOptions): (basepath: string) => Importer;
