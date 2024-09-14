import mongoose from "mongoose";
import dotenv from 'dotenv'
dotenv.config()
mongoose.connect(process.env.MONGODB_URL)
.then(()=>{
    console.log('database connected')
})