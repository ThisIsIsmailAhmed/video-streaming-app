import mongoose from "mongoose";
import { DB_NAME } from "./constant.js"
import DB_CONNECTION  from "./db/index.js";
import {app} from "./app.js"
import dotenv from "dotenv"
dotenv.config({
  path: "./.env"
})

DB_CONNECTION()
.then( () => {
  app.on("error", (err) => {
    console.error("there is an error", err);
    throw(err)
  }) 
  app.listen(process.env.PORT || 8000, (err) => {
     if(err) console.error("server connection failed", err)
     else console.log(`server is running on port ${process.env.PORT || 8000} `)
   })
}).catch( err => {
   console.log(err)
})









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