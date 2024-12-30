import { Router } from "express"
import { upload } from "../middlewares/multer.middleware.js"
import {verifyJWT} from "../middlewares/auth.middleware.js"
import { uploadVideo,
    isPublished
 } from "../controllers/video.controller.js"

const router = Router();

router.use(verifyJWT)

router.route("/test").get((req, res)=>{
    return res.send("All good")
})
router.route("/:userid/upload").post(upload.fields([
    {
        name: "videoFile",
        maxCount: 1
    },
    {
        name: "thumbnail",
        maxCount: 1
    }
]), uploadVideo)

router.route("/:userid/:v_id/publish").post(isPublished)

export default router