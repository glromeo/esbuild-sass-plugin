let esbuild = require("esbuild")

esbuild.build({
    entryPoints: ["./index.ts"],
    bundle: true,
    outdir: "./out",
    plugins: [
        {
            name: "1st",
            setup({onResolve, onLoad}) {
                onResolve({filter: /\.alpha$/}, ({path, pluginData})=>{
                    console.log("1st resolve", path, pluginData)
                    return {pluginData:{data:"skipme"}}
                })
                onLoad({filter: /\.(alpha|beta)$/}, ({path, pluginData})=>{
                    console.log("1st load", path, pluginData)
                })
            }
        },{
            name: "2nd",
            setup({onResolve, onLoad}) {
                onResolve({filter: /\.(alpha|beta)$/}, ({path, pluginData})=>{
                    console.log("2st resolve", path, pluginData)
                })
                onLoad({filter: /\.(alpha|beta)$/}, ({path, pluginData})=>{
                    console.log("2st load", path, pluginData)
                })
            }
        }
    ]
}).catch(e => {})
