import { Router } from "express"
import { upload } from "../middlewares/multer.middleware.js"
import {verifyJWT} from "../middlewares/auth.middleware.js"
import { verifyUserPermission } from "../middlewares/ownerPermissionHandler.middleware.js"
import { uploadVideo,
        isPublished,
        deleteVideo,
        getVideos, 
        getVideoById } from "../controllers/video.controller.js"

const router = Router();

// router.route("/test").get((req, res)=>{
//     return res.send("All good")
// })

router.route("/").get(getVideos)
router.route("/:videoId").get(getVideoById)


// secure routes
router.use(verifyJWT)
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
router.route("/publish").post(verifyUserPermission, isPublished)
router.route("/delete").get(verifyUserPermission, deleteVideo)
export default router