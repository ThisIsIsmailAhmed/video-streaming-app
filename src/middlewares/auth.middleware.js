import jwt from "jsonwebtoken"
import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiResponse } from "../utils/apiResponse.js"
import userModel from "../models/user.model.js"
import {ApiError} from "../utils/apiError.js"


const validateJwt = asyncHandler(async (req, res, next) => {
try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.split(" ")[1]?.trim() 
        if(!token){
            throw new ApiError(401, "you are not authorized")
        }
        console.log(token)
        const decodedToken =  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        console.log(decodedToken)
        const user_id = decodedToken?.id
        const user = await userModel.findById(user_id).select("-password -refreshToken")
        if (!user) {
            throw new ApiError(401, "Invalid Access Token")
        }
        req.user = user
    
        next()
} catch (error) {
    throw new ApiError(401, error?.message || "Invalid access token")
}
})

export default validateJwt