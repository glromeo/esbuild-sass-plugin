const postcss = require('postcss')
const fs = require('fs')

fs.readFile('src/app.css', (err, css) => {
  if (err) {
    console.error(err)
    process.exit(1)
  }
  postcss([
    require('autoprefixer'),
    require('postcss-preset-env')({stage: 0})
  ]).process(css, {from: 'src/app.css', to: 'snapshot/app.css'})
    .then(result => {
      fs.writeFile('snapshot/app.css', result.css, console.log)
      if (result.map) {
        fs.writeFile('snapshot/app.css.map', result.map.toString(), console.log)
      }
    })
})