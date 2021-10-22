import * as chai from "chai";
import {expect} from "chai";
import chaiString from "chai-string";
import * as esbuild from "esbuild";
import * as fs from "fs";
import * as path from "path";
import {sassPlugin, postcssModules} from "../src";

chai.use(chaiString);

describe("tests covering github issues", function () {

    this.timeout(5000);

    let cwd;
    beforeEach(function () {
        cwd = process.cwd();
    });
    afterEach(function () {
        process.chdir(cwd);
    });

    it("#18", async function () {

        await esbuild.build({
            entryPoints: ["./test/issues/18/entrypoint.js"],
            bundle: true,
            outdir: "./test/issues/18/out",
            plugins: [sassPlugin({})]
        });

        let cssBundle = fs.readFileSync("./test/issues/18/out/entrypoint.css", "utf-8");
        expect(cssBundle).to.containIgnoreSpaces(".component_a { background: blue; }");
        expect(cssBundle).to.containIgnoreSpaces(".component_b { background: yellow; }");
    });

    it("issue #20", async function () {

        const absWorkingDir = path.resolve(__dirname, "issues/20");
        process.chdir(absWorkingDir);

        fs.writeFileSync("dep.scss", `$primary-color: #333; body { padding: 0; color: $primary-color; }`);
        fs.writeFileSync("tmp.scss", `@use 'dep'; body {background-color: dep.$primary-color }`);

        let step = 0;

        const result = await esbuild.build({
            entryPoints: ["./tmp.scss"],
            absWorkingDir,
            outfile: "./tmp.css",
            plugins: [sassPlugin()],
            logLevel: "silent",
            watch: {
                onRebuild(failure, result) {
                    switch (step) {
                        case 0:
                            expect(failure).to.be.null;
                            fs.writeFileSync("dep.scss", `$primary-color: #333; body { padding: 0 color: $primary-color; }`);
                            return step++;
                        case 1:
                            expect(failure).to.be.not.null;
                            fs.writeFileSync("dep.scss", `$primary-color: #333; body { padding: 0; color: $primary-color; }`);
                            return step++;
                        case 2:
                            expect(failure).to.be.null;
                            fs.writeFileSync("tmp.scss", `@use 'dep'; body {background-color: dep.$primary-color color: red }`);
                            return step++;
                        case 3:
                            expect(failure).to.be.not.null;
                            fs.writeFileSync("tmp.scss", `@use 'dep'; body {background-color: dep.$primary-color; color: red }`);
                            return step++;
                        case 4:
                            expect(failure).to.be.null;
                            expect(result).to.be.not.null;
                            result!.stop!();
                            return step++;
                    }
                }
            }
        });

        await new Promise((resolve, reject) => {
            fs.writeFileSync("tmp.scss", `@use 'dep'; body {background-color: dep.$primary-color; color: red }`);
            const interval = setInterval(() => {
                if (step === 5) {
                    clearInterval(interval);
                    try {
                        expect(fs.readFileSync("./tmp.css", "utf-8")).to.match(/background-color: #333;/);
                        result.stop!();
                        resolve(null);
                    } catch (e) {
                        reject(e);
                    }
                }
            }, 250);
        });
    });

    it("issue #21", async function () {

        const absWorkingDir = path.resolve(__dirname, "issues/21");
        process.chdir(absWorkingDir);

        await esbuild.build({
            entryPoints: ["./index.scss"],
            absWorkingDir,
            outfile: "./sample.css",
            plugins: [sassPlugin()]
        });

        expect(fs.readFileSync("./sample.css", "utf-8")).to.match(/z-index: 5;/);
    });

    it("issue #23", async function () {

        const absWorkingDir = path.resolve(__dirname, "issues/23");
        process.chdir(absWorkingDir);

        await esbuild.build({
            entryPoints: ["./index.js"],
            absWorkingDir,
            bundle: true,
            outdir: "./out",
            plugins: [sassPlugin({
                type: "style",
                quietDeps: true
            })]
        });

        expect(fs.readFileSync("./out/index.js", "utf-8")).to.match(/background-color: #ae65ff;/);
    });

    it("issue #25", async function () {

        const absWorkingDir = path.resolve(__dirname, "issues/25");
        process.chdir(absWorkingDir);

        const includePath = path.resolve(__dirname, "fixture/node_modules");

        await esbuild.build({
            entryPoints: ["./index.js"],
            absWorkingDir,
            bundle: true,
            outdir: "./out",
            plugins: [sassPlugin({
                implementation: "node-sass",
                includePaths: [includePath]
            })]
        });

        expect(fs.readFileSync("./out/index.css", "utf-8")).to.match(/background-color: red;/);
    });

    it("issue #34", async function () {

        const absWorkingDir = path.resolve(__dirname, "issues/34");
        process.chdir(absWorkingDir);

        const magicImporter = require(require.resolve("node-sass-magic-importer", {paths:[process.cwd()]}));

        let importer = magicImporter();

        await esbuild.build({
            entryPoints: ["main.scss"],
            absWorkingDir,
            bundle: true,
            plugins: [
                sassPlugin({
                    implementation: "node-sass"
                })
            ],
            outfile: "builtin.css",
        });

        await esbuild.build({
            entryPoints: ["main.scss"],
            absWorkingDir,
            bundle: true,
            plugins: [
                sassPlugin({
                    implementation: "node-sass",
                    importer: importer
                })
            ],
            outfile: "magic.css",
        });

        expect(fs.readFileSync("./builtin.css", "utf-8").substring(102))
            .eq(fs.readFileSync("./magic.css", "utf-8").substring(102));
    });


    it("issue #35", async function () {

        const absWorkingDir = path.resolve(__dirname, "issues/35/packages/fonta");
        process.chdir(absWorkingDir);

        const postcssUrl = require("postcss-url");

        await esbuild.build({
            absWorkingDir,
            bundle: true,
            sourcemap: true,
            minify: true,
            splitting: true,
            format: 'esm',
            target: ['esnext'],
            entryPoints: ['./src/FontA.tsx'],
            outdir: './dist/',
            loader: {
                '.woff': 'dataurl',
                '.woff2': 'dataurl',
            },
            plugins: [
                sassPlugin({
                    type: 'css-text',
                    transform: postcssModules({}, [
                        postcssUrl({
                            basePath: "../../",
                            url: 'inline'
                        })
                    ]),
                })
            ],
        });

        expect(fs.readFileSync("./dist/FontA.js", "utf-8")).match(/data:font\/woff2;base64/);
    });
});
