import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apiError.js"
import User from "../models/user.model.js";
import uploadOnCloudinary from "../utils/cloudinary.js"
import ApiResponse from "../utils/apiResponse.js"
import fs from "fs"

const unlinkFile = function (avatarPath, coverImagePath){
  avatarPath && fs.unlinkSync(avatarPath)
  coverImagePath && fs.unlinkSync(coverImagePath)
}

const registerUser = asyncHandler(async (req, res) => {
//get user details from frontend 
  const { fullname, email, username, password } = req.body

// check for images, check for avatar
  const avatarLocalPath = req.files?.avatar[0]?.path

// const coverImageLocalPath = req.files?.coverImage[0]?.path
  let coverImageLocalPath;
  req.files.coverImage ? coverImageLocalPath = req.files?.coverImage[0]?.path : coverImageLocalPath = ""


//validation- fields are not empty
  if (![fullname, email, username, password].every((field)=> field?.trim())){
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
    throw new ApiError(400, "Avatar file is required")
  }

// upload image and avatar on cloudinary
  const avatar = await uploadOnCloudinary(avatarLocalPath)
  const coverImg = await uploadOnCloudinary(coverImageLocalPath)

// check avatar

  if (!avatar){
    throw new ApiError(400, "Avatar file is required")
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




export { registerUser };
