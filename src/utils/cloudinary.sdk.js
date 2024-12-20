import { v2 as cloudinary } from "cloudinary"
import fs from "fs"


cloudinary.config({ 
    cloud_name: "dnzi8twnk", 
    api_key: "235236196778364", 
    api_secret: "GDkElbk6WT_P36hmkh6UhYmrqhI" 
});

const uploadFile = async function(localFilePath){
    try {
     if(!localFilePath) return null
    let result =  await cloudinary.uploader.upload(localFilePath, {
        resource_type: "auto"
     }) 
     fs.unlinkSync(localFilePath)
     return result
    } catch (error) {
        if (localFilePath && fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }
     throw error
    }
}

export default uploadFile









