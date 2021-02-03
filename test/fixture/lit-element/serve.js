const {posix, join, sep} = require("path");
const esbuild = require("esbuild");
const chokidar = require("chokidar");
const {existsSync, rmdirSync, mkdirSync} = require("fs");

if (existsSync("out")) {
    rmdirSync("out", {recursive: true});
}
mkdirSync("out", {recursive: true});

let watcher = chokidar.watch("src", {
    ignoreInitial: true
});

let time, result;

watcher.on("ready", function () {
    time = Date.now();
    result = esbuild.build({
        entryPoints: ["./src/index.ts"],
        bundle: true,
        format: "esm",
        sourcemap: true,
        outdir: "./out",
        // splitting: true,
        define: {"process.env.NODE_ENV": "\"development\""},
        incremental: true,
        plugins: [require("../../../lib/index").sassPlugin({
            type: {
                "style": ["**/src/index.scss"],
                "lit-css": ["**"]
            },
        })]
    }).then(r => {
        console.log("elapsed time:" + ((Date.now() - time) / 1000).toFixed(2));
        return r;
    });

})

watcher.on("change", function () {
    time = Date.now();
    result = result.then(r => r.rebuild()).then(r => {
        console.log("elapsed time:" + ((Date.now() - time) / 1000).toFixed(2));
        return r;
    });
})

const http2 = require('http2');
const fs = require('fs');

const server = http2.createSecureServer({
    key: fs.readFileSync('../cert/localhost.key', "utf-8"),
    cert: fs.readFileSync('../cert/localhost.crt', "utf-8")
});

server.on('error', (err) => console.error(err));

server.on('stream', (stream, headers) => {

    let path = headers[":path"];
    stream.respondWithFile(join(__dirname, path.replace(/\//g, sep)), {
        'content-type': path.endsWith(".js") ? 'application/javascript; charset=utf-8' : 'text/html; charset=utf-8',
        ':status': 200
    }, {
        onError(err) {
            if (err.code === 'ENOENT') {
                stream.respond({':status': 404});
            } else {
                stream.respond({':status': 500});
            }
            stream.end();
        }

    });
});

server.listen(443, () => console.log("go to: https://localhost/public/index.html"));
