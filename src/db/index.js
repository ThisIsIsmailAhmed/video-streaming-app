import mongoose from "mongoose";
import {DB_NAME} from "../constant.js"



const DB_CONNECTION = async function(){
      try{
      let connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}${DB_NAME}`);
      console.log(`MongoDB Database connected db host on: ${connectionInstance.connection.host}`)
      }catch(error){                   
       if(error) console.error(error)
       process.exit(-1)
      }
}

export default DB_CONNECTION