
import dotenv from "dotenv"
import connectDB from "./db/index.js"
import express from "express"
const app = express()

dotenv.config()
connectDB()
    .then(()=>{
        app.listen(process.env.PORT || 8000, ()=>{
            console.log(`Server is running at port ${process.env.PORT}`)
        })
    })
    .catch((err)=>{
        console.log(`Mongo DB connection failed: ${err}`)
    })





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
