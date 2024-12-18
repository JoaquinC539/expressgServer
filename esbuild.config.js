const esbuild=require("esbuild");
const fs = require("fs-extra");
const path = require("path");
const archiver = require("archiver");
const outputFile="server.js"
const outputDir="server"
const configFileName="server.config.json"
const outputZip="server.zip"
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
    
    
    fs.copySync(path.join(__dirname,outputFile),path.resolve(__dirname,outputDir,outputFile));
    fs.copySync(path.join(__dirname,configFileName),path.resolve(__dirname,outputDir,configFileName));
    fs.copySync(path.join(__dirname,config["root"]),path.resolve(__dirname,outputDir,config["root"]),{
        overwrite:true
    });
    const output=fs.createWriteStream(path.join(__dirname,"/",outputZip) );
    const archive=archiver("zip",{zlib:{level:9}});
    output.on("close",()=>{
        console.log(`Archive created: ${outputZip} (${archive.pointer()} bytes)`)
    });    
    output.on('end', function() {
        console.log('Data has been drained');
      });

    archive.on("error",(err)=>{
        throw err;
    });
    archive.pipe(output);
    archive.directory(outputDir,false);
    archive.finalize();
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
    console.log("Bundle complete");
    zipOutput();
}).catch(()=>process.exit(1))