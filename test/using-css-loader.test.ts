import {expect} from "chai";
import * as esbuild from "esbuild";
import * as fs from "fs";
import {sassPlugin} from "../src";

describe("relying on css-loader", function () {

    it("simple import without dependencies", async function () {

        await esbuild.build({
            entryPoints: ["./test/fixture/react/index.tsx"],
            bundle: true,
            format: "esm",
            sourcemap: true,
            outdir: "./test/fixture/react/out",
            define: {"process.env.NODE_ENV": "\"development\""},
            plugins: [sassPlugin({})]
        });

        let cssBundle = fs.readFileSync("./test/fixture/react/out/index.css", "utf-8");
        expect(cssBundle).to.have.string("code {\n" +
            "  font-family: source-code-pro, Menlo, Monaco, Consolas, \"Courier New\", monospace;\n" +
            "}");
        expect(cssBundle).to.have.string("/* sass:D:\\Workspace\\esbuild-sass-plugin\\test\\fixture\\react\\App.scss */\n" +
            ".App .header {\n" +
            "  color: blue;\n" +
            "  border: 1px solid aliceblue;\n" +
            "  padding: 4px;\n" +
            "}");
    });

});