import mongoose from "mongoose";
import Subscription from "../models/subscription.model.js"
import asyncHandler from "../utils/asyncHandler.js"

const subscribe = asyncHandler(async (req, res) => {
    console.log(req.body)
    console.log(req.query)
    return res.status(200).json({status: 200, message: "Request received"})
})

export {
    subscribe
}