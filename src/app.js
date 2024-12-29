import cors from "cors"
import cookieParser from "cookie-parser"
import express from "express"
const app = express()

const corsOption = {
    origin: process.env.CORS_ORIGIN,
    credentials: true
}

app.use(cors(corsOption))
app.use(express.json({ limit: "16kb" }))
app.use(express.urlencoded({extended: true, limit: "16kb"}))
app.use(express.static("public"))
app.use(cookieParser())

//Routes import

import UserRouter from "./routes/user.route.js"
import SubscriptionRouter from "./routes/subscribe.route.js"
import videoRoute from "./routes/video.route.js"

app.use("/api/v1/users", UserRouter);
app.use("/api/v1/subscription", SubscriptionRouter);
app.use("api/v1/video", videoRoute)

export default app
