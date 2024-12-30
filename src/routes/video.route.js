import { Router } from "express"
import { upload } from "../middlewares/multer.middleware.js"
import {verifyJWT} from "../middlewares/auth.middleware.js"
import { isValidUser } from "../middlewares/validuser.middleware.js"
import { uploadVideo,
        isPublished,
        deleteVideo,
        getVideos } from "../controllers/video.controller.js"

const router = Router();

router.route("/").get(getVideos)

// secure routes
router.use(verifyJWT)

router.route("/test").get((req, res)=>{
    return res.send("All good")
})
router.route("/:userId/upload").post(upload.fields([
    {
        name: "videoFile",
        maxCount: 1
    },
    {
        name: "thumbnail",
        maxCount: 1
    }
]), uploadVideo)

router.route("/publish").post(isValidUser, isPublished)
router.route("/delete").get(isValidUser, deleteVideo)
export default router