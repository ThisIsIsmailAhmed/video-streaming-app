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


const deleteFile = async function(fileUrl) {
    try {
      // Extract the public ID from the Cloudinary URL
      const publicId = extractPublicIdFromUrl(fileUrl);
      
      // Delete the file using the destroy method
      const result = await cloudinary.uploader.destroy(publicId, { resource_type: 'auto' });
      
      console.log(result);
      return result;
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
}
  
  // Helper function to extract public ID from Cloudinary URL
  function extractPublicIdFromUrl(url) {
    // Implement logic to extract public ID from URL
    // This will depend on your URL structure
  }

export {uploadFile, deleteFile}









