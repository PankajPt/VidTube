import ApiError from "../utils/apiError.js"
import asyncHandler from "../utils/asyncHandler.js"
import ApiResponse from "../utils/apiResponse.js"
import User from "../models/user.model.js"
import Video from "../models/video.model.js"
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js"
import fs from "fs"
import mongoose from "mongoose"

// upload video
const unlinkFile = (file1, file2) => {
    file1 && fs.unlinkSync(file1)
    file2 && fs.unlinkSync(file2)
}

const uploadVideo = asyncHandler(async(req, res)=>{
    // console.log(req.files, req.body)
    // check video file and thumbnail is present
    const userId = req.params?.userId;
    const videoFilePath = req.files?.videoFile?.[0]?.path;
    const thumbnailPath = req.files?.thumbnail?.[0]?.path;
    // console.log(videoFilePath, thumbnailPath, userId)
    
    // check for title, description, 
    const { title, description } = req.body
    if([videoFilePath, thumbnailPath, title, description, userId].some((field) => !field )){
        unlinkFile(videoFilePath, thumbnailPath)
        throw new ApiError(400, "All fields (videoFile, thumbnail, title, description) are required and must not be empty")
    }

    // upload on cloudinary
    const thumbnail = await uploadOnCloudinary(thumbnailPath, "image")
    const video = await uploadOnCloudinary(videoFilePath, "video")
    

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
            videoFile: video?.secure_url,
            thumbnail: thumbnail?.secure_url,
            title,
            description,
            duration: video.duration,
            owner: userId
        }
    )

    const uploadResponse = newVideo.toObject()
    delete uploadResponse.description
    delete uploadResponse.__v
    // duration from cloudinary response 
    // console.log(uploadResponse)

    return res
        .status(200)
        .json(new ApiResponse(200, uploadResponse, "Video uploaded sucessfully"))
})

// make it private-public
const isPublished =  asyncHandler(async(req, res)=>{
    
    const videoId = req._video._id
    const publish = req.query?.publish
    
    const video = await Video.findByIdAndUpdate(videoId,
        {
            $set: {
                isPublished: publish
            }
        },
        {
            new: true
        }
    ).select("_id title isPublished owner")

    if (!video){
        throw new ApiError(500, "Something went wrong while updating status. Please try again")
    }

    return res
            .status(200)
            .json(new ApiResponse(200, video, "Status updated successfully"))
})

// delete video

const deleteVideo = asyncHandler(async(req, res)=>{
     const videoId = req._video._id
     const videoPath = req._video.videoFile
     const thumbnailPath = req._video.thumbnail

     const destroy = await Video.deleteOne({_id: videoId})
    //  console.log(destroy)
     if (!(destroy || destroy.deletedCount !== 1)){
        throw new ApiError(500, "Something went wrong while deleting video. Please try again")
     }

    //  future: can create backlog with id to clear 
     await deleteFromCloudinary(videoPath, "video")
     await deleteFromCloudinary(thumbnailPath, "image")

     return res
        .status(200)
        .json(new ApiResponse(200, destroy, "Video deleted successfully"))
})

const getVideos = asyncHandler(async(req, res)=>{
    const videos = await Video.find({ isPublished: true}).select("-__v")
    return res
        .status(200)
        .json(new ApiResponse(200, videos, "videos fetched successfully" ))
})

const getVideoById = asyncHandler(async(req, res) => {
    // get id from params
    // getuser id from if available
    // validate video objectid
    // fetch from db
    // update video views count
    // update user watch history
    
})

export { uploadVideo,
        isPublished,
        deleteVideo,
        getVideos,
        getVideoById
    }