const path = require("path");
const fs = require("fs");

function getSecondsSice(start) {
    return (Date.now() - start) / 1000;
}

module.exports = {

    cleanFixture(basedir) {
        const outdir = path.resolve(basedir, "out")
        try {
            fs.rmSync(outdir, {force: true, recursive: true})
        } catch (ignored) {
        }
    },

    get logSuccess() {
        const start = Date.now()
        return success => {
            console.log(`build successful in ${getSecondsSice(start)}sec`)
        }
    },

    get logFailure() {
        const start = Date.now()
        return error => {
            console.log(`build failed after ${getSecondsSice(start)}sec:`, error)
        }
    },
}