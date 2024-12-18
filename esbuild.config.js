const esbuild=require("esbuild");
const fs = require("fs-extra");
const path = require("path");
const archiver = require("archiver");
const outputFile="server.js"
const outputDir="server"
const configFileName="server.config.json"
function zipOutput(){
    const configPath = path.resolve(__dirname, "server.config.json");
    const config=JSON.parse(fs.readFileSync(configPath,"utf-8"))
    const outpt=fs.existsSync(outputFile);
    if(!outpt){
        throw new Error("Output does not exist")
    }
    const rootDir=fs.existsSync(config["root"])
    if(!rootDir){
        throw new Error("Root element does not exist");
    }
    const configDir=fs.existsSync(configFileName)
    if(!rootDir){
        throw new Error("Root element does not exist");
    }
    fs.ensureDirSync(outputDir);
    fs.copySync(path.join(__dirname,outputFile),path.resolve(__dirname,outputDir));
    fs.copySync(path.join(__dirname,configFileName),path.resolve(__dirname,outputDir));
    fs.copySync(path.join(__dirname,config["root"]),path.resolve(__dirname,outputDir),{
        overwrite:true
    });
    
    const archive=archiver("zip",{zlib:{level:9}});
}

esbuild.build({
    entryPoints:["index.js"],
    outfile:outputFile,
    bundle:true,
    platform:"node",
    target:"node18",
    sourcemap:false,
    minify:true
}).then(()=>{    
    console.log("Bundle complete")
    zipOutput();
}).catch(()=>process.exit(1))