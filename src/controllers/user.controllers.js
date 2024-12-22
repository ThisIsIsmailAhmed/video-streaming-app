import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/apiError.js"
import userModel from "../models/user.model.js"
import uploadFile from "../utils/cloudinary.sdk.js"
import { ApiResponse } from "../utils/apiResponse.js"

const registerUser = asyncHandler(async (req, res) => {

    const {fullName, email, password, username } = req.body
    if(
         [ fullName, email, password, username ].some( field => field?.trim() === "" ) 
    ){
      throw new ApiError(400, "all fields are required")  
    }

 let user = await userModel.findOne({
      $or: [{username}, {email}]    
})
    if(user){
        throw new ApiError(401, "user already exists")
    }

const avatarPath = req.files?.avatar[0]?.path

if(!avatarPath){
    throw new ApiError(409, "avatar is required to signup")
  }

let coverImagePath;
if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0 ){
    coverImagePath = req.files.coverImage[0].path
}

const avatar = await uploadFile(avatarPath)
const coverImage = await uploadFile(coverImagePath)

if(!avatar){ 
     throw new ApiError(400, "avatar not uploaded on cloudinary")
}

const createdUser = await userModel.create({
    fullName,
    email,
    password,
    username: username.toLowerCase(),
    avatar: avatar.url,
    coverImage: coverImage?.url || ""
})

const responseUser = await userModel.findById(createdUser._id).select("-password -refreshToken")

if(!responseUser){
    throw new ApiError(500, "user not found")
}
   return res.status(201).json(
    new ApiResponse(200, createdUser, "User registered Successfully")
)})

const generateAccessAndRefreshToken = async function (userId) {
    
    const user = await userModel.findById(userId)
    let refreshToken = await user.generateAccessToken()
    let accessToken = await user.generateRefreshToken()

    user.refreshToken = refreshToken
    user.save({ validateBeforeSave: false })
    
    
    
    return { refreshToken, accessToken }
}

const loginUser = asyncHandler(async (req, res) => {
    
    const { username, email, password} = req.body
    if (!(username || email)) {
        throw new ApiError("username or email is required")
    }
    const user = await userModel.findOne({
        $or: [{email}, {username}]
    })

    if(!user){
        throw new ApiError(404, "user does not exists")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if (!isPasswordValid) {
        throw new ApiError(401, "the password is incorrect")
    }

    const { refreshToken, accessToken } = await generateAccessAndRefreshToken(user._id)

    const loggedInUser = await user.select("-password -refreshToken")

    const options = {
        httpOnly : true,
        secure: true
    }

    return res.status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200,
            {
                user: loggedInUser,
                refreshToken,
                accessToken

            },
            "User logged in successfully!"
        )
    )
})

const logoutUser = asyncHandler(async (req, res) => {
    const user = await userModel.findById( req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
     ) 

     const options = {
        httpOnly: true,
        secure: true 
     }

     return res.status(200)
     .clearCookie('accessToken', options)
     .
     
})



export {
     registerUser,
     loginUser
     }