// sass:/Users/Gianluca/Workbench/Workspace/esbuild-sass-plugin/test/fixture/css-modules/src/example.module.scss
var css = `._message_1vmzm_1 {
  color: white;
  background-color: red;
  font-size: 24px;
}`;
document.head.appendChild(document.createElement("style")).appendChild(document.createTextNode(css));
var example_module_default = {
  "message": "_message_1vmzm_1"
};

// sass:/Users/Gianluca/Workbench/Workspace/esbuild-sass-plugin/test/fixture/css-modules/src/common.module.scss
var css2 = `._message_bxgcs_1 {
  font-family: Roboto, sans-serif;
}`;
document.head.appendChild(document.createElement("style")).appendChild(document.createTextNode(css2));
var common_module_default = {
  "message": "_message_bxgcs_1"
};

// src/index.js
document.body.insertAdjacentHTML("afterbegin", `
    <div class="${example_module_default.message} ${common_module_default.message}">Hello World</div>
`);
