let fs = require("fs");

fs.writeFileSync("./src/banner-import.scss", `
    .banner {
        font-size: 30px;
        color: white;
        background-color: crimson;
        font-family: "Arial", sans-serif;
    }
`)

fs.writeFileSync("./src/alternate-import.css", `
    .banner {
        font-size: 20px;
        color: yellow;
        background-color: green;
        font-family: "Roboto", sans-serif;
    }
`)