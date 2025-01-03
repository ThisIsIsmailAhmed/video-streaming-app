import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/apiError.js"
import userModel from "../models/user.model.js"
import uploadFile from "../utils/cloudinary.sdk.js"
import { ApiResponse } from "../utils/apiResponse.js"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import user from "../models/user.model.js"
import mongoose from "mongoose"


const registerUser = asyncHandler(async (req, res) => {

    const { fullName, email, password, username } = req.body
    if (
        [fullName, email, password, username].some(field => field?.trim() === "")
    ) {
        throw new ApiError(400, "all fields are required")
    }

    let user = await userModel.findOne({
        $or: [{ username }, { email }]
    })
    if (user) {
        throw new ApiError(401, "user already exists")
    }

    const avatarPath = req.files?.avatar[0]?.path

    if (!avatarPath) {
        throw new ApiError(409, "avatar is required to signup")
    }

    let coverImagePath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImagePath = req.files.coverImage[0].path
    }

    const avatar = await uploadFile(avatarPath)
    const coverImage = await uploadFile(coverImagePath)

    if (!avatar) {
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

    if (!responseUser) {
        throw new ApiError(500, "user not found")
    }
    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered Successfully")
    )
})

const generateAccessAndRefreshToken = async function (userId) {

    const user = await userModel.findById(userId)
    let accessToken = await user.generateAccessToken()
    let refreshToken = await user.generateRefreshToken()

    user.refreshToken = refreshToken
    await user.save({ validateBeforeSave: false })



    return { refreshToken, accessToken }
}

const loginUser = asyncHandler(async (req, res) => {

    const { username, email, password } = req.body
    if (!(username || email)) {
        throw new ApiError("username or email is required")
    }
    const user = await userModel.findOne({
        $or: [{ email }, { username }]
    })

    if (!user) {
        throw new ApiError(404, "user does not exists")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if (!isPasswordValid) {
        throw new ApiError(401, "the password is incorrect")
    }

    const { refreshToken, accessToken } = await generateAccessAndRefreshToken(user._id)

    const loggedInUser =  await userModel.findOne(user._id).select(" -password -refreshToken ")

    const options = {
        httpOnly: true,
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
    const user = await userModel.findByIdAndUpdate(req.user._id,
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
        .clearCookie('refreshToken', options)
        .send("user loggedout successfully")

})

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies?.refreshToken || req.header("Authorization")?.split(" ")[1]?.trim();
    if (!incomingRefreshToken) {
        throw new ApiError(401, "You are not authorized")
    }
    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
        
        if (!decodedToken) {
             throw new ApiError(401, "something is wrong with the decoded token")
        }

        const user = await userModel.findById(decodedToken.id)

        if(!user){
          throw new ApiError(401, "user not found")
        }
          
        if(incomingRefreshToken !== user?.refreshToken){
            throw new ApiError(401, "Invalid Refresh Token")
           }
        

        const { accessToken, newRefreshToken } = await generateAccessAndRefreshToken(user._id)

        return res.status(200)
        .cookie("accessToken", accessToken)
        .cookie("refreshToken", newRefreshToken)
        .json(
            new ApiResponse(200,
                { accessToken, RefreshToken: newRefreshToken },
                "Access token refreshed"
            )
        )



    } catch (error) {
        throw new ApiError(401, error?.message || "invalid Access Token")
    }
})


const changeUserPassword = asyncHandler( async (req, res) => {
    const { currentPassword, newPassword } = req.body
    if(!(currentPassword &&  newPassword)){
        throw new ApiError(401, "current and new Password is required")
    }

    const user = await userModel.findById(req.user._id)
    
    const passwordComparison = await user.isPasswordCorrect(currentPassword)

    if (!passwordComparison){
        throw new ApiError(401, "current Password is Incorrect")
    }
      
    user.password = newPassword 

    await user.save()    

    return res.status(200).json(
        new ApiResponse(
            200,
            {},
            "password changed successfully"
        )
    )

})

const updateUserDetails = asyncHandler(async (req, res) => {
   
    const {fullName, email} = req.body
       
    if(!(fullName || email)){
        throw new ApiError(401, "fullName or email is required")
    }
    
    const user = await userModel.findById(req.user?._id)

    /* another approach we can use
     
    const user = await userModel.findByIdAndUpdate(req.user?._id,
     
    { 
        $set: {
           fullName,
           email
        }
     },

     { new : true }

    ).select(" -password -refreshToken")
    
    */

    if(!user){
        throw new ApiError(401, "user not found")
    }

    if(fullName){
        user.fullName = fullName
    }

    if(email){
        user.email = email
    }

    await user.save({ validateBeforeSave: false })

    return res.status(200).json(
        new ApiResponse(200,
            {
               updatedUser: user
            },
            "user details updated successfully"
        ))
})

const loggedInUsersDetails = asyncHandler(async (req, res) => {
    return res.status(200).json(
        new ApiResponse(
            200,
            { user : req.user },
            "user sent"
        ))
})

const updateUserAvatar = asyncHandler(async (req, res) => {

    const user = await userModel.findById(req.user?._id)
    
    if(!user){
        throw new ApiError(400, "user doesn't exists")
    }
    
    let avatarPath = req.file?.avatar?.[0]?.path

    if(!avatarPath){
        throw new ApiError(401, "avatar file is required")
    }

    let avatar = await uploadFile(avatarPath)

    if(!avatar.url){
        throw new ApiError(401, "error while uploading avatar")
    }

   user.avatar = avatar.url
   
   await user.save({validateBeforeSave: false})
   
   let responseUser = await userModel.findById(req.user?.id).select("-password -refreshToken")

   return res.status(200).json(
     new ApiResponse(200, 
        {
            user: responseUser
        },
        "avatar updated successfully"
     )
)
})

const updateUserCoverImage = asyncHandler(async (req, res) => {

    const user = await userModel.findById(req.user?._id)
    
    if(!user){
        throw new ApiError(400, "user doesn't exists")
    }
    
    let coverImagePath = req.file?.coverImage?.[0]?.path

    if(!coverImagePath){
        throw new ApiError(401, "Cover image file is required")
    }

    let coverImage = await uploadFile(coverImagePath)

    if(!coverImage.url){
        throw new ApiError(401, "error while uploading cover image")
    }

   user.coverImage = coverImage.url
   
   await user.save({validateBeforeSave: false})
   
   let responseUser = await userModel.findById(req.user?.id).select("-password -refreshToken")

   return res.status(200).json(
     new ApiResponse(200, 
        {
            user: responseUser
        },
        "coverImage updated successfully"
     )
)
})

const userPage = asyncHandler(async (req, res) => {
   
    const username = req.params.username
   
    if(!username.trim()){
      throw new ApiError(400, "username is missing" )
    }

    const channel = await userModel.aggregate([
        {
          $match: {
            username: username?.toLowerCase()
          }
        },
        {
          $lookup: {
             from: "subscriptions",
             localField: "_id",
             foreignField: "channel",
             as: "subscribers"
          }
        },
        {
            $lookup: {
             from: "subscriptions",
             localField: "_id",
             foreignField: "subscriber",
             as: "subscribedTo"
            }
        },
        {
            $addFields: {
                subscriberCount:{
                    $size: "$subscribers"
                },
                channelSubscribedToCount: {
                $size: "$subscribedTo"
                },
                isSubscribed:{
                   $cond: {
                    if: {$in: [req.user?._id, "$subscribers.subscriber"] },
                    then: true,
                    else: false
                   }
                }
            }

        },
        {
            $project: {
                username: 1,
                email: 1,
                fullName: 1,
                avatar: 1,
                coverImage: 1,
                subscriberCount: 1,
                isSubscribed: 1,
                channelSubscribedToCount: 1
            }
        }
    ])

    return res.status(200)
    .json(new ApiResponse(
        200,
        {channel:  channel },
        "Channel details updated successfully"
    ));

})

const getWatchHistory = asyncHandler(async (req, res) => {
    const user = userModel.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.user._id)
            }   
        },
        {
            $lookup: {
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                pipeline: [{
                    $lookup: {
                        from: "users",
                        localField: "owner",
                        foreignField: "_id",
                        pipeline: [
                            {
                                $project: {
                                    fullName: 1,
                                    username: 1,
                                    avatar: 1
                                } 
                            }
                        ],
                        as: "owner",
                    }
                },
                {

                    $addFields: {
                        owner: {
                            $getElemat: [ "$owner", 0 ]
                        }
                    }

                }
            ]
            }
        }
    ]) 

    return res.status(200).json(
        new ApiResponse(
            200,
            user[0].watchHistory,
            "user history fetched successfully"
        )
    )

})

export {
    registerUser,
    logoutUser,
    loginUser,
    refreshAccessToken,
    changeUserPassword,
    loggedInUsersDetails,
    updateUserDetails,
    updateUserAvatar,
    updateUserCoverImage,
    userPage,
    getWatchHistory
}