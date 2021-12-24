const {writeFileSync} = require('fs')

writeFileSync("./src/banner-import.scss", `
  .banner {
    font-size: 30px;
    color: white;
    background-color: crimson;
    font-family: "Arial", sans-serif;
  }
`)

writeFileSync("./src/alternate-import.css", `
  .banner {
    font-size: 20px;
    color: yellow;
    background-color: green;
    font-family: "Roboto", sans-serif;
  }
`)