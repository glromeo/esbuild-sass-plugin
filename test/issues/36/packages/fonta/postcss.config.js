console.log("esbuild cwd:", process.cwd());

module.exports = {
  plugins: [
    require("postcss-url")({
      basePath: "../",
      url: 'inline'
    })
  ]
}
