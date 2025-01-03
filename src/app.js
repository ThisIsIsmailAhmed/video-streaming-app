import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser"
import path from "path"

import { fileURLToPath } from 'url'
 const __filename = fileURLToPath(import.meta.url)
 const __dirname = path.dirname(__filename)

 const app = express();

app.use(express.json({
    limit: "16kb"
}))

app.use(express.urlencoded({extended: true, limit: "16kb"}))

app.use(cookieParser())
 
app.use(express.static(path.join(__dirname, "..","public")))

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

// importing routes
import userRouter from "./routes/user.routes.js"
app.use('/api/v1/users', userRouter)



export { app }