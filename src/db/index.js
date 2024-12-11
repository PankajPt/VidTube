import mongoose, { mongo } from "mongoose";
import { DB_NAME } from "../constants.js"
import dotenv from "dotenv"
dotenv.config()

const connectDB = async () => {
    try {
       const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
       console.log(`\n MongoDB Connected !!! DB_HOST: ${connectionInstance.connection.host}`)
    } catch (error) {
        console.log(`MongoDB connection error: ${error}`)
        process.exit(1)
    }
}

export default connectDB