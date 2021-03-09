import { OnLoadResult } from "esbuild";
import { Importer, types } from "sass";
export declare type Options = {
    implementation?: string;
    basedir?: string;
    type?: string | ([string] | [string, string | [string] | [string, string]])[];
    cache?: Map<string, Map<string, CachedResult>> | boolean;
    picomatch?: any;
    importer?: Importer | Importer[];
    functions?: {
        [key: string]: (...args: types.SassType[]) => types.SassType | void;
    };
    includePaths?: string[];
    indentedSyntax?: boolean;
    indentType?: 'space' | 'tab';
    indentWidth?: number;
    linefeed?: 'cr' | 'crlf' | 'lf' | 'lfcr';
    outputStyle?: 'compressed' | 'expanded';
    sourceMap?: boolean | string;
    sourceMapContents?: boolean;
    sourceMapEmbed?: boolean;
    sourceMapRoot?: string;
};
export declare type CachedResult = {
    filename: string;
    type: string;
    mtimeMs: number;
    result: OnLoadResult;
};
