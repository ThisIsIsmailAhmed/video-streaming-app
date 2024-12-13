import { v2 as cloudinary } from "cloudinary"
import fs from "fs"


cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET // Click 'View API Keys' above to copy your API secret
});

const uploadFile = async function(localFilePath){
    try {
     if(!localFilePath) return null
     const upload =  await cloudinary.uploader
     .upload(localFilePath, {
        resource_type: "auto"
     }) 
    } catch (error) {
        fs.unlinkSync(localFilePath)
    }
}

export default uploadFile









