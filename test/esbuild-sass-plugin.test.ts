import * as chai from "chai";
import {expect} from "chai";
// @ts-ignore
import chaiString from "chai-string";
import * as esbuild from "esbuild";
import * as fs from "fs";
import * as path from "path";
import {sassPlugin, postcssModules} from "../src";

chai.use(chaiString);

describe("esbuild sass plugin tests", function () {

    this.timeout(5000);

    let cwd;
    beforeEach(function () {
        cwd = process.cwd();
    })
    afterEach(function () {
        process.chdir(cwd);
    })

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
        expect(cssBundle).to.containIgnoreSpaces("@-ms-viewport { width: device-width; }");
        expect(cssBundle).to.containIgnoreSpaces(
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
                includePaths: [path.resolve(__dirname, "fixture/lit-element")],
                quietDeps: true
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
        expect(cssBundle).to.have.string(`__publicField(HelloWorld, "styles", hello_world_default);`);
        expect(cssBundle).to.have.string("document.head.appendChild(document.createElement(\"style\")).appendChild(document.createTextNode(css2));");
        expect(cssBundle).to.have.string("var css2 = `.container {\n" +
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
            "}`;");
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
                basedir: path.resolve(__dirname, "fixture"),
                type: "style",
                quietDeps: true
            })]
        });

        let cssBundle = fs.readFileSync("./test/fixture/bootstrap/out/index.js", "utf-8");
        expect(cssBundle).to.have.string("// test/fixture/bootstrap/index.js\n" +
            "document.body.innerHTML =");
        expect(cssBundle).to.have.string("document.head.appendChild(document.createElement(\"style\")).appendChild(document.createTextNode(css));\n");
        expect(cssBundle).to.have.string("var css = `@charset \"UTF-8\";\n/*!\n * Bootstrap v5.1.0");
    });

    it("open-iconic (dealing with relative paths & data urls)", async function () {

        const absWorkingDir = path.resolve(__dirname, "fixture/open-iconic");
        process.chdir(absWorkingDir);

        let styleSCSS = fs.readFileSync("./src/styles.scss", "utf-8");
        expect(styleSCSS).to.have.string(
            "$iconic-font-path: 'open-iconic/font/fonts/';"
        );

        await esbuild.build({
            entryPoints: ["./src/styles.scss"],
            absWorkingDir: absWorkingDir,
            outdir: "./out",
            bundle: true,
            format: "esm",
            loader: {
                ".eot": "file",
                ".woff": "file",
                ".ttf": "file",
                ".svg": "file",
                ".otf": "file"
            },
            plugins: [sassPlugin()]
        });

        let outCSS = fs.readFileSync("./out/styles.css", "utf-8");
        expect(outCSS).to.match(/url\(\.\/open-iconic-[^.]+\.eot\?#iconic-sm\) format\("embedded-opentype"\)/);

        await esbuild.build({
            entryPoints: ["./src/index.ts"],
            absWorkingDir: absWorkingDir,
            outfile: "./out/bundle.js",
            bundle: true,
            format: "esm",
            loader: {
                ".eot": "dataurl",
                ".woff": "dataurl",
                ".ttf": "dataurl",
                ".svg": "dataurl",
                ".otf": "dataurl"
            },
            plugins: [sassPlugin()]
        });

        let outFile = fs.readFileSync("./out/bundle.css", "utf-8");
        expect(outFile).to.have.string(
            "src: url(data:application/vnd.ms-fontobject;base64,JG4AAHxt"
        );

        await esbuild.build({
            entryPoints: ["./src/index.ts"],
            absWorkingDir: absWorkingDir,
            outdir: "./out",
            bundle: true,
            format: "esm",
            plugins: [sassPlugin({
                type: "lit-css",
                async transform(css, resolveDir) {
                    const {outputFiles: [out]} = await esbuild.build({
                        stdin: {
                            contents: css,
                            resolveDir,
                            loader: "css"
                        },
                        bundle: true,
                        write: false,
                        format: "esm",
                        loader: {
                            ".eot": "dataurl",
                            ".woff": "dataurl",
                            ".ttf": "dataurl",
                            ".svg": "dataurl",
                            ".otf": "dataurl"
                        }
                    });
                    return out.text;
                }
            })]
        });

        let outJS = fs.readFileSync("./out/index.js", "utf-8");
        expect(outJS).to.have.string(
            "src: url(data:application/vnd.ms-fontobject;base64,JG4AAHxt"
        );

    });

    it("post-css", async function () {

        const absWorkingDir = path.resolve(__dirname, "fixture/post-css");
        process.chdir(absWorkingDir);

        const postcss = require(require.resolve("postcss", {paths: [absWorkingDir]}));
        const autoprefixer = require(require.resolve("autoprefixer", {paths: [absWorkingDir]}));
        const postcssPresetEnv = require(require.resolve("postcss-preset-env", {paths: [absWorkingDir]}));

        const postCSS = postcss([autoprefixer, postcssPresetEnv({stage: 0})]);

        await esbuild.build({
            entryPoints: ["./src/app.css"],
            absWorkingDir,
            outdir: "./out",
            bundle: true,
            loader: {
                ".jpg": "dataurl"
            },
            plugins: [sassPlugin({
                async transform(source) {
                    const {css} = await postCSS.process(source, {from: undefined});
                    return css;
                }
            })]
        });

        let expected = fs.readFileSync("./dest/app.css", "utf-8");
        expected = expected.replace(/url\("img\/background(-2x)?.jpg"\)/g, "url()");
        let actual = fs.readFileSync("./out/app.css", "utf-8");
        actual = actual.slice(actual.indexOf("\n") + 1).replace(/url\(data:image\/jpeg;base64,\)/g, "url()");
        expect(actual.replace(/;/g, "")).to.equalIgnoreSpaces(expected.replace(/;/g, ""));
    });

    it("cache test", async function () {

        const absWorkingDir = path.resolve(__dirname, "fixture/cache");
        process.chdir(absWorkingDir);

        fs.writeFileSync("./index.sass", fs.readFileSync("./index-v1.sass"));

        const result = await esbuild.build({
            entryPoints: ["./index.js"],
            absWorkingDir,
            outdir: "./out",
            bundle: true,
            incremental: true,
            plugins: [sassPlugin({cache: true})]
        });

        expect(fs.readFileSync("./out/index.css", "utf-8").replace(/\/\*.+\*\//g, "")).to.equalIgnoreSpaces(`
            body { font: 100% Helvetica, sans-serif; color: #333; }
        `);

        fs.writeFileSync("./index.sass", fs.readFileSync("./index-v1.sass"));

        await result.rebuild();

        expect(fs.readFileSync("./out/index.css", "utf-8").replace(/\/\*.+\*\//g, "")).to.equalIgnoreSpaces(`
            body { font: 100% Helvetica, sans-serif; color: #333; }
        `);

        fs.writeFileSync("./dependency.sass", fs.readFileSync("./dependency-v1.sass"));
        fs.writeFileSync("./index.sass", fs.readFileSync("./index-v2.sass"));

        await result.rebuild();

        expect(fs.readFileSync("./out/index.css", "utf-8").replace(/\/\*.+\*\//g, "")).to.equalIgnoreSpaces(`
            body { background-color: red; } 
            body { font: 99% "Times New Roman", serif; color: #666; }
        `);

        fs.writeFileSync("./dependency.sass", fs.readFileSync("./dependency-v2.sass"));

        await result.rebuild();

        expect(fs.readFileSync("./out/index.css", "utf-8").replace(/\/\*.+\*\//g, "")).to.equalIgnoreSpaces(`
            body { background-color: blue; } 
            body { font: 99% "Times New Roman", serif; color: #666; }
        `);

        result.rebuild.dispose();
    });

    it("watched files", async function () {

        const absWorkingDir = path.resolve(__dirname, "fixture/watch");
        process.chdir(absWorkingDir);

        require("./fixture/watch/initial");
        let count = 0;

        const result = await esbuild.build({
            entryPoints: ["./src/index.js"],
            absWorkingDir,
            outdir: "./out",
            bundle: true,
            plugins: [sassPlugin({type: "css-text"})],
            watch: {
                onRebuild(error, result) {
                    count++;
                }
            }
        });

        expect(fs.readFileSync("./out/index.js", "utf-8")).to.match(/crimson/);

        let {mtimeMs} = fs.statSync("./out/index.js");

        await new Promise<void>((resolve, reject) => {

            const timeout = setTimeout(reject, 10000);

            setTimeout(function tryAgain() {
                if (mtimeMs < fs.statSync("./out/index.js").mtimeMs) {
                    clearTimeout(timeout);
                    resolve();
                } else {
                    setTimeout(tryAgain, 1000);
                }
            }, 1000);

            require("./fixture/watch/update");
        });

        expect(count).to.eq(1);

        expect(fs.readFileSync("./out/index.js", "utf-8")).to.match(/cornflowerblue/);

        result.stop!();
    });

    it("css modules", async function () {

        const absWorkingDir = path.resolve(__dirname, "fixture/css-modules");
        process.chdir(absWorkingDir);

        await esbuild.build({
            entryPoints: ["./src/index.js"],
            absWorkingDir,
            outdir: "./build/",
            bundle: true,
            format: "esm",
            plugins: [
                sassPlugin({
                    transform: postcssModules({
                        localsConvention: "camelCaseOnly"
                    })
                }),
            ]
        });

        let cssBundle = fs.readFileSync("./build/index.js", "utf-8");
        expect(cssBundle).to.containIgnoreSpaces('class="${example_module_default.message} ${common_module_default.message}"');
        expect(cssBundle).to.containIgnoreSpaces(`
            var common_module_default = {
                "message": "_message_bxgcs_1"
            };
        `);
        expect(cssBundle).to.containIgnoreSpaces(`
            var example_module_default = {
                "message": "_message_1vmzm_1"
            };
        `);
    });
});
