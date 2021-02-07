import {expect} from "chai";
import * as esbuild from "esbuild";
import * as fs from "fs";
import * as path from "path";
import {sassPlugin} from "../src";

describe("esbuild sass plugin tests", function () {

    it("react application (css loader)", async function () {

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
        expect(cssBundle).to.have.string(
            ".App .header {\n" +
            "  color: blue;\n" +
            "  border: 1px solid aliceblue;\n" +
            "  padding: 4px;\n" +
            "}");
    });

    it("lit-element component (import css result)", async function () {

        await esbuild.build({
            entryPoints: ["./test/fixture/lit-element/src/index.ts"],
            bundle: true,
            format: "esm",
            sourcemap: true,
            outdir: "./test/fixture/lit-element/out",
            define: {"process.env.NODE_ENV": "\"development\""},
            plugins: [sassPlugin({
                basedir: path.join(__dirname, "test", "fixture"),
                type: [
                    ["style", "src/index.scss"],
                    ["lit-css"]
                ],
                includePaths: [path.resolve(__dirname, "fixture/lit-element")]
            })]
        });

        let cssBundle = fs.readFileSync("./test/fixture/lit-element/out/index.js", "utf-8");
        expect(cssBundle).to.have.string("var hello_world_default = css`\n" +
            ".banner {\n" +
            "  font-family: sans-serif;\n" +
            "  color: blue;\n" +
            "  background: black;\n" +
            "  border: 5px solid blue;\n" +
            "  padding: 20px;\n" +
            "}`;\n");
        expect(cssBundle).to.have.string("HelloWorld.styles = hello_world_default;");
        expect(cssBundle).to.have.string("document.head.appendChild(document.createElement(\"style\")).appendChild(document.createTextNode(`\n" +
            ".container {\n" +
            "  display: flex;\n" +
            "  flex-direction: column;\n" +
            "}\n" +
            "\n" +
            ".banner {\n" +
            "  font-family: sans-serif;\n" +
            "  border: 5px solid red;\n" +
            "  padding: 20px;\n" +
            "  background: black;\n" +
            "  color: red;\n" +
            "}`));\n");
    });

    it("boostrap sass (adding style elements)", async function () {

        await esbuild.build({
            entryPoints: ["./test/fixture/bootstrap/index.js"],
            bundle: true,
            format: "esm",
            sourcemap: true,
            outdir: "./test/fixture/bootstrap/out",
            define: {"process.env.NODE_ENV": "\"development\""},
            plugins: [sassPlugin({
                type: "style",
                includePaths: [path.resolve(__dirname, "fixture/bootstrap")]
            })]
        });

        let cssBundle = fs.readFileSync("./test/fixture/bootstrap/out/index.js", "utf-8");
        expect(cssBundle).to.have.string("// test/fixture/bootstrap/index.js\n" +
            "document.body.innerHTML =");
        expect(cssBundle).to.have.string(
            "document.head.appendChild(document.createElement(\"style\")).appendChild(document.createTextNode(`\n" +
            "@charset \"UTF-8\";\n" +
            "/*!\n" +
            " * Bootstrap v4.6.0 (https://getbootstrap.com/)");
    });

});
