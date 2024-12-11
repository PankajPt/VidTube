
import dotenv from "dotenv"
import connectDB from "./db/index.js"
import express from "express"
const app = express()

dotenv.config()
connectDB()





/*
(async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        app.on("Error", (error)=>{
            console.log(`Error: ${error}`)
            throw error
        })

        app.listen(process.env.PORT, ()=>{
            console.log(`App listening on port: ${process.env.PORT}`)
        })
    } catch (error) {
        console.log(`Error: ${error}`)
        throw error
    }
})()
*/
