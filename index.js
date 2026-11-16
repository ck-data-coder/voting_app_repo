

import { execSync } from "child_process";

console.log("Node version:", process.version);

try {
    console.log(
        execSync("npm ls jsonwebtoken jws jwa buffer-equal-constant-time", {
            encoding: "utf8"
        })
    );
} catch (error) {
    console.log("Dependency inspection:", error.stdout);
}

import express from 'express'
import './database.js'
import cors from 'cors'
import bodyParser from 'body-parser'
import router from './router.js'
import dotenv from 'dotenv'
import  path  from 'path'
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config()
const server =express()
server.use(cors())
server.use(bodyParser.json())
server.use(bodyParser.urlencoded({extended:false}))
server.use(express.static(path.join(__dirname,'build')))
server.use('/api',router)
server.use('*',(req,res)=>{
    res.sendFile(path.join(__dirname,'build','index.html'))
})
server.listen(process.env.PORT)
