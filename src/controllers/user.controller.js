import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apiError.js"
import User from "../models/user.model.js";
import uploadOnCloudinary from "../utils/cloudinary.js"
import ApiResponse from "../utils/apiResponse.js"
import fs from "fs"
import jwt from "jsonwebtoken"
import mongoose from "mongoose";


const  options = {
  httpOnly: true,
  secure: true
}

const unlinkFile = function (avatarPath, coverImagePath){
  avatarPath && fs.unlinkSync(avatarPath)
  coverImagePath && fs.unlinkSync(coverImagePath)
}

const generateAccessAndRefreshToken = async (userID) => {
  try {
    const user = await User.findOne(userID)
    const accessToken = user.generateAccessToken()
    const refreshToken = user.generateRefreshToken()
    user.refreshToken = refreshToken
    await user.save({ validateBeforeSave: false })

    return {accessToken, refreshToken}

  } catch (error) {
    throw new ApiError(500, "Something went wrong while generating refresh and access token")
  }
}

const registerUser = asyncHandler(async (req, res) => {
//get user details from frontend 
  const { fullname, email, username, password } = req.body
  console.log(req.body, req.files)

// check for images, check for avatar
  let avatarLocalPath;
  req.files.avatar ? avatarLocalPath = req.files?.avatar[0]?.path : avatarLocalPath = ""

// const coverImageLocalPath = req.files?.coverImage[0]?.path
  let coverImageLocalPath;
  req.files.coverImage ? coverImageLocalPath = req.files?.coverImage[0]?.path : coverImageLocalPath = ""


//validation- fields are not empty
  if (![fullname, email, username, password, avatarLocalPath].every((field)=> field?.trim())){
    unlinkFile(avatarLocalPath, coverImageLocalPath)
    throw new ApiError(400, "All fields are required")
  }
  
// check if user already exists: username, email
  const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    })
  if (existingUser){
    unlinkFile(avatarLocalPath, coverImageLocalPath)
    throw new ApiError (409, "Username or email already exits")
  }

  if (!avatarLocalPath){
    unlinkFile(avatarLocalPath, coverImageLocalPath)
    throw new ApiError(400, "Avatar file is required")
  }

// upload image and avatar on cloudinary
  const avatar = await uploadOnCloudinary(avatarLocalPath)
  const coverImg = await uploadOnCloudinary(coverImageLocalPath)

// check avatar

  if (!avatar){
    throw new ApiError(500, "Error while uploading on cloudinary...")
  }

// create user object and create entry DB

  const user = await User.create({
    fullname,
    avatar: avatar.url,
    coverImage: coverImg?.url || "",
    email,
    password,
    username: username.toLowerCase()
  })

// remove password and refresh token from field

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  )

//  check user
  if (!createdUser){
    throw new ApiError(500, "Something went wrong while registering the user")
  }

// return res
  return res.status(201).json(
    new ApiResponse(200, createdUser, "User registered successfully")
  )
});

const loginUser = asyncHandler ( async (req, res) => {
// req body -- data
  const { username, email, password } = req.body

// username or email
  if (!(username || email)){
    throw new ApiError(400, "Username or Email is required")
  }

// find the user
const user = await User.findOne({
  $or: [{username}, {email}]
})

if (!user){
  throw new ApiError(404, "User does not exist")
}
// password check-- here user is instance created by mongodb model and method is called on instance
const isPasswordValid = await user.isPasswordCorrect(password)
if (!isPasswordValid){
  throw new ApiError(401, "Invalid user credentials")
}

// access and refresh token
const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id)

// send cookie (either update or make another db query )
const loggedInUser = await User.findById(user._id).select("-password -refreshToken")


return res
  .status(200)
  .cookie("accessToken", accessToken, options)
  .cookie("refreshToken", refreshToken, options)
  .json(
    new ApiResponse(200, { user: loggedInUser, accessToken, refreshToken }, "User logged in sucessfully")
  )
})

const logOutUser = asyncHandler (async (req, res) => {
 const logout = await User.findByIdAndUpdate(req.user._id, 
    {
      $unset: { refreshToken: 1 }
    },
    {
      new: true
    }
  )

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User Logged Out"))
})

const refreshAccessToken = asyncHandler (async (req, res)=>{
  const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

  if (!incomingRefreshToken){
    throw new ApiError(401, "Unauthorized request")
  }

try {
    const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
    const user = await User.findById(decodedToken._id)
    if (!user){
      throw new ApiError("Invalid refresh token")
    }
  
    if (incomingRefreshToken !== user?.refreshToken){
      throw new ApiError(401, "Refresh token is expired or used")
    }
  
    const {accessToken, newRefreshToken} = await generateAccessAndRefreshToken(user._id)
  
    return res  
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(new ApiResponse(200, {accessToken, refreshToken: newRefreshToken}, "Access Token Refreshed"))
      
} catch (error) {
  throw new ApiError(401, error?.message || "Invalid access token")
}
})

const changePassword = asyncHandler (async(req, res)=>{
  const { oldPassword, newPassword, confirmPassword } = req.body
  if ([oldPassword, newPassword, confirmPassword].every((field)=> !field )){
    throw new ApiError(400, "All field are required")
  }

  const user = await User.findById(req.user?._id)
  const isOldPasswordCorrect = await user.isPasswordCorrect(oldPassword)

  if (!isOldPasswordCorrect){
    throw new ApiError(401, "Invalid old password...")
  }

  if (newPassword !== confirmPassword){
    throw new ApiError(409, "new password and confirmed paassword not match")
  }

  user.password = confirmPassword
  await user.save({validateBeforeSave: false})

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"))

})

const getCurrentUser = asyncHandler(async(req, res)=>{
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "Current user fetch successfully."))
})

const updateAccountDetails = asyncHandler(async(req, res)=>{
  const {fullname, email} = req.body
  if (!(fullname && email)){
    throw new ApiError(400, "All fields are required")
  }

  const user = await User.findByIdAndUpdate(req.user?._id,
    {
      $set: {
        fullname,
        email
      }
    },
    {new: true}).select("-password")

    return res
      .status(200)
      .json(new ApiResponse(200, user, "Account details updated successfully"))
})

const updateAvatar = asyncHandler(async(req, res)=>{
  const avatarLocalPath = req.file?.path
  if (!avatarLocalPath){
    throw new ApiError(400, "Avatar file is missing")
  }
  const avatar = await uploadOnCloudinary(avatarLocalPath)
  if (!avatar.url){
    throw new ApiError(500, "Error while uploading avatar file, please try again")
  }

  const user = await User.findOneAndUpdate(
    req.user?._id,
    {
      $set: {
        avatar: avatar.url
      }
    },{
      new: true
    }
  ).select("-password")

  return res
  .status(200)
  .json(new ApiResponse(200, user, "Avatar image updated successfully"))

})

const updateCoverImage = asyncHandler(async(req, res)=>{
  const coverImageLocalPath = req.file?.path
  if (!coverImageLocalPath){
    throw new ApiError(400, "Cover Image file is missing")
  }
  const newCoverImage = await uploadOnCloudinary(coverImageLocalPath)
  if (!newCoverImage.url){
    throw new ApiError(500, "Error while uploading cover image file, please try again")
  }

  const user = await User.findOneAndUpdate(
    req.user?._id,
    {
      $set: {
        coverImage: newCoverImage.url
      }
    },{
      new: true
    }
  ).select("-password")

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Cover image updated successfully"))
})

const getUserChannelProfile = asyncHandler(async(req, res)=>{
  const { username } = req.params || req.query

  if(!username?.trim()){
    throw new ApiError(400, "Username is missing")
  }

  const channel = await User.aggregate([
    {
      $match: {
        username: username?.toLowerCase()
      }
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers"
      }
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedTo"
      }
    },
    {
      $addFields: {
        subscribersCount: { $size: "$subscribers"},
        channelsSubscribedToCount: { $size: "$subscribedTo"},
        isSubscribed: {
          $cond: {
            if: { $in: [req.user?._id, "$subscribers.subscriber"]},
            then: true,
            else: false
          }
        }
      }
    },
    {
      $project: {
        username: 1,
        email: 1,
        fullname: 1,
        subscribersCount: 1,
        channelsSubscribedToCount: 1,
        isSubscribed: 1,
        avatar: 1,
        coverImage: 1
      }
    }
  ])
  console.log(channel)

  if (!channel?.length){
    throw new ApiError(404, "Channel does not exists")
  }

  return res
    .status(200)
    .json(new ApiResponse(200, channel[0], "Channel fetched successfully"))
})


const getWatchHistory = asyncHandler(async(req, res)=>{
  const user = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(req.user._id)
      }
    },
    {
      $lookup: {
        from: "videos",
        localField: "watchHistory",
        foreignField: "_id",
        as: "watchHistory",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [
                {
                  $project: {
                    fullname: 1,
                    username: 1,
                    avatar: 1
                  }
                }
              ]
            }
          },
          {
            $addFields: {
              $owner: {
                $first: "$owner"
              }
            }
          }
        ]
      }
    }
  ])

  return res
    .status(200)
    .json(new ApiResponse(200, user[0].watchHistory, "Watch History fetched successfully"))
})

export { 
  registerUser,
  loginUser,
  logOutUser,
  refreshAccessToken,
  changePassword,
  getCurrentUser,
  updateAccountDetails,
  updateAvatar,
  updateCoverImage,
  getUserChannelProfile,
  getWatchHistory
};
