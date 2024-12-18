const express = require("express")
const path = require("path");
const fs = require("fs");
const bodyParser = require("body-parser");
const cookieParser=require("cookie-parser");
const cors=require("cors")

const configPath = path.resolve(__dirname, "server.config.json");
const config = JSON.parse(fs.readFileSync(configPath, "utf-8"))
const corsConfig={
    origin:function(origin,callback){
        if(config['allowed-origins'].indexOf(origin) !==-1 ||!origin){
            callback(null,true);
        }else{
            callback(new Error("Not allowed by CORS"));
        }
    }
}

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser())
app.use(cors(corsConfig))

app.use(express.static(config['root']));

if (config["fallBackToIndex"]) {
    app.use((req,res,next)=>{
        const indexPath=path.join(__dirname,config['root'],config["entryPoint"]);
        if(fs.existsSync(indexPath)){
            res.sendFile(indexPath)
        }else{
            res.status(404).send("404 Not Found")
        }
    });
}

app.listen(config["port"],()=>{
    console.log(`Server is running on  http://localhost:${config["port"]}`);
    console.log(`Serving static files from ${config['root']}`)
})



