import mongoose from "mongoose";
import { DB_NAME } from "../constants.js"
import dotenv from "dotenv"
dotenv.config()

const connectDB = async () => {
    try {
        // console.log(`Connection String: ${process.env.MONGODB_URI}/${DB_NAME}`);
       const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}`, {
        dbName: DB_NAME
       })
       console.log(`\n MongoDB Connected !!! DB_HOST: ${connectionInstance.connection.host}`)
    } catch (error) {
        console.log(`MongoDB connection error: ${error}`)
        process.exit(1)
    }
}

export default connectDB