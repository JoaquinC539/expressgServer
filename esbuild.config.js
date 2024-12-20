const esbuild=require("esbuild");
const fs = require("fs-extra");
const path = require("path");
const archiver = require("archiver");
const outputFile="server.js"
const outputDir="server"
const configFileName="server.config.json"
const outputZip="server.zip"
const outputZipTar="server.tar.gz"
function zipOutput(){    
    if(!fs.existsSync(configFileName)){
        console.error("Config file does not exist");
        throw new Error("Config file does not exist");
    }
    const configPath = path.resolve(__dirname, "server.config.json");
    const config=JSON.parse(fs.readFileSync(configPath,"utf-8"))
    const outpt=fs.existsSync(outputFile);
    if(!outpt){
        console.error("Output does not exist");
        throw new Error("Output does not exist");
    }
    const rootDir=fs.existsSync(config["root"])
    if(!rootDir){
        console.error("Root element does not exist");
        throw new Error("Root element does not exist");
    }
    

    if(fs.existsSync(outputDir)){
        fs.rmSync(outputDir,{recursive:true,force:true}); 
     }
     fs.mkdirSync(outputDir,{recursive:true})
    
    fs.copySync(path.join(__dirname,outputFile),path.resolve(__dirname,outputDir,outputFile));
    fs.copySync(path.join(__dirname,configFileName),path.resolve(__dirname,outputDir,configFileName));
    fs.copySync(path.join(__dirname,config["root"]),path.resolve(__dirname,outputDir,config["root"]),{
        overwrite:true
    });

    // Create ZIP archive
    let zipOutput = fs.createWriteStream(path.join(__dirname, outputZip));
    let zipArchive = archiver("zip", { zlib: { level: 9 } });

    zipOutput.on("close", () => {
        console.log(`ZIP Archive created: ${outputZip} (${zipArchive.pointer()} bytes)`);
    });
    zipOutput.on("end", () => {
        console.log("ZIP Archive data has been drained.");
    });
    zipArchive.on("error", (err) => {
        throw err;
    });

    zipArchive.pipe(zipOutput);
    zipArchive.directory(outputDir, false);
    zipArchive.finalize();

    // Create TAR file
    let tarOutput = fs.createWriteStream(path.join(__dirname, outputZipTar));
    let tarArchive = archiver("tar", { zlib: { level: 9 } });

    tarOutput.on("close", () => {
        console.log(`TAR.GZ Archive created: ${outputZipTar} (${tarArchive.pointer()} bytes)`);
    });
    tarOutput.on("end", () => {
        console.log("TAR.GZ Archive data has been drained.");
    });
    tarArchive.on("error", (err) => {
        throw err;
    });

    tarArchive.pipe(tarOutput);
    tarArchive.directory(outputDir, false);
    tarArchive.finalize();
    
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