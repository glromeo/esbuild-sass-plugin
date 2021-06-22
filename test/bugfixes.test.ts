import * as chai from "chai";
import {expect} from "chai";
// @ts-ignore
import chaiString from "chai-string";
import * as esbuild from "esbuild";
import * as fs from "fs";
import * as path from "path";
import {sassPlugin} from "../src";

chai.use(chaiString);

describe("tests covering github issues", function () {

    this.timeout(5000);

    it("#18", async function () {

        await esbuild.build({
            entryPoints: ["./test/fixture/issues/18/entrypoint.js"],
            bundle: true,
            outdir: "./test/fixture/issues/18/out",
            plugins: [sassPlugin({})]
        });

        let cssBundle = fs.readFileSync("./test/fixture/issues/18/out/entrypoint.css", "utf-8");
        expect(cssBundle).to.containIgnoreSpaces(".component_a { background: blue; }");
        expect(cssBundle).to.containIgnoreSpaces(".component_b { background: yellow; }");
    });
});