const http2 = require("http2");
const fs = require("fs");
const {join, sep} = require("path");

const fixture = process.argv[2];
if (!fixture) {
    console.log("usage: node serve <fixture>");
    process.exit(1);
}

const server = http2.createSecureServer({
    key: fs.readFileSync(join(__dirname, "cert/localhost.key"), "utf-8"),
    cert: fs.readFileSync(join(__dirname, "cert/localhost.crt"), "utf-8")
});

server.on("error", (err) => console.error(err));

server.on("stream", (stream, headers) => {

    let path = headers[":path"];
    stream.respondWithFile(join(__dirname, fixture, path.replace(/\//g, sep)), {
        "content-type": path.endsWith(".js")
            ? "application/javascript; charset=utf-8"
            : path.endsWith(".css")
                ? "text/css; charset=utf-8"
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

server.listen(443, () => {
    const prefix = fs.existsSync(join(__dirname, fixture, "public")) ? "public/" : "";
    console.log(`serving '${fixture}' fixture at: https://localhost/${prefix}index.html`);
});
