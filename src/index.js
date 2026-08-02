import dns from "node:dns"
import dotenv from "dotenv";
import connectDB from "./db/index.js";
import {app} from "./app.js"

dns.setServers(["8.8.8.8", "1.1.1.1"]);

dotenv.config({
    path: './.env'
})

connectDB()
.then(() => {
    app.listen(process.env.PORT || 8000, () => {
        console.log(`Server is running on port ${process.env.PORT || 8000}`);
    });
})
.catch((err) => {
    console.log("MongoDB connection failed:", err);
});



// import mongoose from "mongoose";
// import { DB_NAME } from "./constants";

// import express from "express";
// const app = express();

// //Method 2 using db file separately to connect to database and start server(more professional way)
// //Method 1 to connect to database and start server using async/await
// (async() => {
//     try {
//         await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
//         app.on("error",() => {           //these are the event listeners for the express app
//             console.error("ERROR:", error);
//             throw error;
//         })

//         app.listner(process.env.PORT, () => {
//             console.log(`Server is running on port ${process.env.PORT}`);
//         })
//     } catch (error) {
//         console.error("ERROR:", error);
//         throw error;
//     }
// })()