import esbuild from "esbuild";
import {sassPlugin} from "../../../lib/index.js";

esbuild.build({
    entryPoints: [
        "styles.scss"
    ],
    bundle: false,
    outfile: "styles.css",
    sourcemap: true,
    plugins: [
        sassPlugin({})
    ],
    watch: {
        onRebuild(failure, result) {
            console.log(new Date().toLocaleTimeString(), failure ? ":(" : ":)");
        }
    }
}).then(()=>console.log("OK!")).catch(() => {
    console.log("KO!")
    process.exit(1);
});