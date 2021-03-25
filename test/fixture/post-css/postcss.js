const postcss = require("postcss");
const postcssPresetEnv = require("postcss-preset-env");
const fs = require("fs");

fs.readFile("src/app.css", (err, css) => {
    postcss([postcssPresetEnv({ stage: 0 }), require("autoprefixer")])
        .process(css, {from: "src/app.css", to: "dest/app.css"})
        .then(result => {
            fs.writeFile("dest/app.css", result.css, () => true);
            if (result.map) {
                fs.writeFile("dest/app.css.map", result.map.toString(), () => true);
            }
        });
});