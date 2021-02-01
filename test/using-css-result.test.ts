import {expect} from "chai";
import * as esbuild from "esbuild";
import * as fs from "fs";
import {sassPlugin} from "../src";

describe("using css result", function () {

    it("lit-element example", async function () {

        await esbuild.build({
            entryPoints: ["./test/fixture/lit-element/index.ts"],
            bundle: true,
            format: "esm",
            sourcemap: true,
            outdir: "./test/fixture/lit-element/out",
            define: {"process.env.NODE_ENV": "\"development\""},
            plugins: [sassPlugin({
                format: "lit-css"
            })]
        });

        let cssBundle = fs.readFileSync("./test/fixture/lit-element/out/index.js", "utf-8");
        expect(cssBundle).to.have.string("HelloWorld.styles = styles_default;");
        expect(cssBundle).to.have.string("// sass:D:\\Workspace\\esbuild-sass-plugin\\test\\fixture\\lit-element\\styles.scss\n" +
            "var styles_default = css`\n" +
            ".Hello .banner {\n" +
            "  color: #7ec1ff;\n" +
            "  background: black;\n" +
            "  border: 2px solid red;\n" +
            "}`;");
    });

});