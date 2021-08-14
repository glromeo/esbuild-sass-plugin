import esbuild from "esbuild";
import {sassPlugin} from "../../../../lib/index.js"; // "esbuild-sass-plugin";
import * as fs from "fs";

let sources = [`
// This is OK
@use 'base';

.inverse {
  background-color: base.$primary-color;
  color: red;
}
`, `
// This wil fail
@use 'base';

.inverse {
  background-color: base.$primary-color
  color: red;
}    
`]

let which = 0;

setInterval(function () {
    console.log("updated with", which ? "bad" : "good")
    fs.writeFileSync("main.scss",sources[which]);
    which = which ? 0 : 1;
}, 1000);
fs.writeFileSync("main.scss",sources[which]);


esbuild.build({
    entryPoints: [
        "main.scss"
    ],
    bundle: false,
    outfile: "styles.css",
    sourcemap: true,
    plugins: [
        sassPlugin({})
    ],
    logLevel: "debug",
    watch: {
        onRebuild(failure, result) {
            console.log(new Date().toLocaleTimeString(), failure ? "rebuild failed" : "rebuild done");
        }
    }
}).then(() => {
    console.log("build done");
}).catch(() => {
    console.log("build failed");
    process.exit(1);
});