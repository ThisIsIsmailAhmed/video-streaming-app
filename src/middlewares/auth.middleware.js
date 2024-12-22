import jwt from "jsonwebtoken"
import asyncHandler from "../utils/asyncHandler.js"
import { ApiResponse } from "../utils/apiResponse.js"
import userModel from "../models/user.model.js"
import {ApiError} from "../utils/apiError.js"


const validateJwt = asyncHandler(async (req, _, next) => {
try {
        const token = req.cookies?.accessToken || req.header(Authorization)?.split(" ")(1).trim()
        if(!token){
            throw new ApiError(401, "you are not authorized")
        }
        const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN);
        const user_id = decoded._id
        const user = await userModel.findOneById(user_id).select("-password -refreshToken")
        if (!user) {
            throw new ApiError(401, "Invalid Access Token")
        }
        req.user = findUser
    
        next()
} catch (error) {
    throw new ApiError(401, error?.message || "Invalid access token")
}
})

export default validateJwt