import { v2 as cloudinary } from "cloudinary"
import fs from "fs"

cloudinary.config({ 
    cloud_name: process.env.CLODINARY_CLOUD_NAME, 
    api_key: process.env.CLODINARY_API_KEY, 
    api_secret: process.env.CLODINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null

        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        console.log(`File is uploaded on cloudinary, ${response.url}`)
        fs.unlinkSync(localFilePath)
        return response
    } catch (error) {
        fs.unlinkSync(localFilePath)
    }
}

const deleteFromCloudinary = async (uri) => {
    try {
        if (!uri) return `Uri required`

        const [publicId] = uri?.split('/').pop().split('.')

        if (!publicId) return `Public-Id not found`

        const deleteRes = await cloudinary.uploader.destroy(publicId, {
           resource_type: "image"
        })
        console.log(`File ${uri} is removed from cloudinary`)

        return deleteRes
    } catch (error) {
        console.log(error)
    }
}

export { uploadOnCloudinary,
    deleteFromCloudinary }