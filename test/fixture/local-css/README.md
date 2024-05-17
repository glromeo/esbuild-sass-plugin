### Example `build.js`
```javascript
const esbuild = require("esbuild");
const {sassPlugin, postcssModules} = require("esbuild-sass-plugin");

esbuild.build({
    entryPoints: ["./src/index.js"],
    outdir: "build/",
    bundle: true,
    format: "esm",
    plugins: [
        sassPlugin({
            type: 'local-css'
        }),
    ]
}).catch(() => process.exit(1));
```

### ...remember the dependencies in `package.json`
```json
  "dependencies": {
    ...
    "esbuild": "^0.12.20",
    "esbuild-sass-plugin": "^1.5.0"
    ...
  }
```

**Note**:

This project is slightly different from the example because it's part of the fixtures
