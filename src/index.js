import mongoose from "mongoose";
import { DB_NAME } from "./constant.js"
import DB_CONNECTION  from "./db/index.js";
import dotenv from "dotenv"
dotenv.config({
  path: "./.env"
})


DB_CONNECTION()




/*
import express from "express";
const app = express();
;( async () => {
    try{
      await mongoose.connect(`${process.env.MONGODB_URI}${DB_NAME}`);
      app.on("error", (err) => {
          console.log(`error: ${err}`)
          throw(err)
      })
    }catch(err){
     if(err) console.error(err)
    }
})()
*/