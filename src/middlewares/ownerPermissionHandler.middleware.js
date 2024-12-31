import asyncHandler from "../utils/asyncHandler.js"
import ApiError from "../utils/apiError.js"
import Video from "../models/video.model.js"


export const verifyUserPermission = asyncHandler(async(req, _, next) => {
    const videoId = req.query?.videoId

    if (!videoId){
        throw new ApiError(400, "videoId required..")
    }

    // from jwt
    const userId = req.user._id
    const video = await Video.findById(videoId)
    // console.log(userId, video)

    if (!video){
        throw new ApiError(404, "Video not found")
    }

    if ( userId.equals(video.owner)){
        req._video = video
        next()
    }else {
        throw new ApiError(403, "Unauthorized request")
    }
    
})