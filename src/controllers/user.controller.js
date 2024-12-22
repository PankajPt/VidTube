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
const  options = {
  httpOnly: true,
  secure: true
}

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
      $set: { refreshToken: undefined }
    },
    {
      new: true
    }
  )

  const  options = {
    httpOnly: true,
    secure: true
  }

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User Logged Out"))
})

export { 
  registerUser,
  loginUser,
  logOutUser
};
