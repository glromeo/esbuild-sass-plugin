let fs = require("fs");

fs.writeFileSync("./src/banner-import.scss", `
    .banner {
        font-size: 30px;
        color: white;
        background-color: cornflowerblue;
        font-family: "Times New Roman", serif;
    }
`);

fs.writeFileSync("./src/alternate-import.css", `
    .banner {
        font-size: 20px;
        color: yellow;
        background-color: orange;
        font-family: "Courier New", monospace;
    }
`);