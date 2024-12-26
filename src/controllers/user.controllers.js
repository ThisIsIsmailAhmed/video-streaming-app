import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/apiError.js"
import userModel from "../models/user.model.js"
import uploadFile from "../utils/cloudinary.sdk.js"
import { ApiResponse } from "../utils/apiResponse.js"
import jwt from "jsonwebtoken"

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

    const loggedInUser = await userModel.findOne(user._id).select(" -password -refreshToken ")

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


const updateUser = asyncHandler( async (req, res) => {

})

export {
    registerUser,
    logoutUser,
    loginUser,
    refreshAccessToken
}