import { Router } from "express";
import { loginUser, 
    registerUser, 
    logOutUser, 
    refreshAccessToken,
    changePassword,
    getCurrentUser,
    updateAccountDetails,
    updateAvatar,
    updateCoverImage,
    getUserChannelProfile,
    getWatchHistory } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js"
import {verifyJWT} from "../middlewares/auth.middleware.js"
const router = Router();

// router.route("/").get((req, res)=>{res.send("<h1>Wlcome to VidTube...</h1>")})

router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }]),
    registerUser
);

router.route("/login").post(loginUser)
router.route("/refresh-token").post(refreshAccessToken)

// secured routes
router.use(verifyJWT)
router.route("/logout").post(logOutUser)
router.route("/change-password").post(changePassword)
router.route("/get-user").get(getCurrentUser)
router.route("/update-acount").patch(updateAccountDetails)
router.route("/update-avatar").patch(upload.single("avatar"), updateAvatar)
router.route("/update-cover-img").patch(upload.single("coverImg"), updateCoverImage)
router.route("/channel/:username").get(getUserChannelProfile)
router.route("/history").get(getWatchHistory)

export default router