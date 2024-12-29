import mongoose, { Schema } from "mongoose"
import ApiError from "../utils/apiError.js"
import asyncHandler from "../utils/asyncHandler.js"
import ApiResponse from "../utils/apiResponse.js"
import User from "../models/user.model.js"
import Video from "../models/video.model.js"
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js"
import fs from "fs"

// upload and publish video
const unlinkFile = (file1, file2) => {
    file1 && fs.unlinkSync(file1)
    file2 && fs.unlinkSync(file2)
}

const uploadAndPublish = asyncHandler(async(req, res)=>{
 
    // check video file and thumbnail is present
    const videoFilePath = req.files.videoFile[0]?.path
    const thumbnailPath = req.files.thumbnail[0]?.path

    // check for title, description, 
    const { title, description, isPublic } = req.body
    if([videoFilePath, thumbnailPath, title, description].every((field) => !field )){
        unlinkFile(videoFilePath, thumbnailPath)
        throw new ApiError(400, "All fields are required...")
    }

    // upload on cloudinary
    const video = await uploadOnCloudinary(videoFilePath, "video")
    const thumbnail = await uploadOnCloudinary(thumbnailPath, "image")
    console.log(video)
    console.log(thumbnail)

    if (!video){
        unlinkFile(videoFilePath, thumbnailPath)
        throw new ApiError(500, "Something went wrong while uploading video. Please try again")
    }

    if (!thumbnail){
        unlinkFile(videoFilePath, thumbnailPath)
        throw new ApiError(500, "Something went wrong while uploading thumbnail. Please try again")
    }

    // save in database

    const newVideo = await Video.create(
        {
            videoFile: video?.uri,
            thumbnail: thumbnail?.uri,
            title,
            description,
            duration: "yet to decide",
            isPublished: isPublic
        }
    )
    // duration from cloudinary response 
    console.log(newVideo)

    return res
        .status(200)
        .json(new ApiResponse(200, newVideo, "Video uploaded sucessfully"))
})

export { uploadAndPublish }