const {posix, join, sep} = require("path");
const esbuild = require("esbuild");
const chokidar = require("chokidar");
const {existsSync, rmdirSync, mkdirSync, readFileSync} = require("fs");
const {sassPlugin} = require("../../lib");

const fixture = process.argv[2];

if (!fixture) {
    console.error("no fixture specified.");
    process.exit(1);
}

const src = join(__dirname, fixture, "src");
const out = join(__dirname, fixture, "out");

if (existsSync(out)) {
    rmdirSync(out, {recursive: true});
}
mkdirSync(out, {recursive: true});

let result;

const watcher = chokidar.watch(src, {ignoreInitial: true});

watcher.on("ready", async function () {
    console.time("initial build");
    result = await esbuild.build({
        entryPoints: [require.resolve(`./${fixture}`)],
        bundle: true,
        format: "esm",
        sourcemap: false,
        outdir: out,
        define: {"process.env.NODE_ENV": "\"development\""},
        incremental: true,
        plugins: [
            sassPlugin(JSON.parse(readFileSync(join(__dirname, fixture, "plugin-config.json"), "utf-8")))
        ]
    });
    console.timeEnd("initial build");
});

watcher.on("change", async function () {
    if (result !== null) {
        console.time("incremental build");
        const rebuild = result.rebuild();
        result = null;
        result = await rebuild;
        console.timeEnd("incremental build");
    }
});

const http2 = require("http2");
const fs = require("fs");

const server = http2.createSecureServer({
    key: fs.readFileSync(join(__dirname, "cert", "localhost.key"), "utf-8"),
    cert: fs.readFileSync(join(__dirname, "cert", "localhost.crt"), "utf-8")
});

server.on("error", (err) => console.error(err));

server.on("stream", (stream, headers) => {

    let path = headers[":path"];
    stream.respondWithFile(join(__dirname, fixture, path.replace(/\//g, sep)), {
        "content-type": path.endsWith(".js")
            ? "application/javascript; charset=utf-8"
            : "text/html; charset=utf-8",
        ":status": 200
    }, {
        onError(err) {
            if (err.code === "ENOENT") {
                stream.respond({":status": 404});
            } else {
                stream.respond({":status": 500});
            }
            stream.end();
        }

    });
});

server.listen(443, () => console.log("go to: https://localhost/public/index.html"));
