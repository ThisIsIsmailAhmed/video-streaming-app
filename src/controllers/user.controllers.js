import { asyncHandler } from "../utils/asyncHandler.js"
import { apiError } from "../utils/apiError.js"
import userModel from "../models/user.model.js"
import uploadFile from "../utils.cloudinary.sdk.js"

const registerUser = asyncHandler(async (req, res) => {

    const {fullname, email, password, username } = req.body

    if(
        [ fullname, email, password, username ].some((field) => {
            field?.trim() === ""
        }) 
    ){
      throw new apiError(401, "all fields are required")  
    }

 let user =   await userModel.findOne({
      $or: [{username : username}, {email: email}]    
})
    if(user){
        throw new apiError(401, "user already exists")
    }

const avatarPath = req.files?.avatar[0]?.path
const coverImagePath = req.files?.coverImage[0]?.path    

if(!avatarPath){
  throw new apiError(409, "avatar is required to signup")
}
   const avatar = await  uploadFile(avatarPath)
   const coverImage = await uploadFile(coverImagePath)

const createdUser = await userModel.create({
    fullname: fullname,
    email: email,
    password: password,
    username: username.toLowerCase(),
    avatar: avatar.url,
    coverImage: coverImage?.url || ""
})

})


export { registerUser }