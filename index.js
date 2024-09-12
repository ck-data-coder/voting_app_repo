import express from 'express'
import './database.js'
import cors from 'cors'
import bodyParser from 'body-parser'
import router from './router.js'
import dotenv from 'dotenv'
dotenv.config()
const server =express()
server.use(cors())
server.use(bodyParser.json())
server.use(bodyParser.urlencoded({extended:false}))
server.use('/',router)
server.listen(process.env.PORT)