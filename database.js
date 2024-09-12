import mongoose from "mongoose";
import dotenv from 'dotenv'
dotenv.config()
mongoose.connect(process.env.DATABASE_URL)
.then(()=>{
    console.log('database connected')
})