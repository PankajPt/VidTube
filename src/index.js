
import dotenv from "dotenv"
import connectDB from "./db/index.js"
import app from "./app.js"
dotenv.config()
connectDB()
    .then(()=>{
        app.get('/', (req, res)=>{
            res.send(`<h1>It's Working</h1>`)
        })
        app.listen(process.env.PORT || 5000, ()=>{
            console.log(`Server is running on http://localhost:${process.env.PORT || 5000}`);
        })
    })
    .catch((err)=>{
        console.log(`Mongo DB connection failed: ${err}`)
    })
