import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({limit: "16KB"}))
app.use(express.urlencoded({extended:true, limit: "16kb"}))
app.use(express.static("public"))
app.use(cookieParser())


// routes import

import userRouter from './routes/user.routes.js';



// routes decalaration

// before we were directly writing app.get() because routes were declared in this same file but now
// routes are declared in separate file therefore we need to call middleware and from that move to our routes file
app.use("/api/v1/users", userRouter)         // https://localhost:8000/api/v1/users/register



export {app}