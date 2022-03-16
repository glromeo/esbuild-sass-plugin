(() => {
  // style.scss
  var css = `body {
  font: 100% Helvetica, sans-serif;
  color: #333;
}`;
  var style = document.createElement("style");
  style.setAttribute("nonce", "12345");
  style.appendChild(document.createTextNode(css));
  document.head.appendChild(style);

  // index.js
  document.body.innerHTML = `<div>Hello World</div>`;
})();
