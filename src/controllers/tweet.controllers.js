import mongoose, { isValidObjectId } from "mongoose"
import tweetModel from "../models/tweet.model.js"
import userModel from "../models/user.model.js"
import {ApiError} from "../utils/apiError.js"
import {ApiResponse} from "../utils/apiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    let {content} = req.body

    if(!content){
        throw new ApiError(404, "content not provided")
    }
    
    let tweet = await tweetModel.create({
        owner: req.user._id,
        content
    })

    return res.status(200).json(new ApiResponse(200, {"tweet": tweet}, "tweet"))

})

const getUserTweets = asyncHandler(async (req, res) => {
    
    try {
        let pipeline = await tweetModel.aggregate([
            {
                $match: {
                    owner: req.user._id
                }
            },
            {
                $lookup: {
                    from: "user",
                    localField: "owner",
                    foreignField: "_id",
                    as: "usersTweets",
                    pipeline: [{
                        $project: {
                            avatar: 1,
                            username: 1,
                            fullname: 1
                        }
                    }]
                },
            },
            {
                $addFields: {
                    $owner: {
                        $arrayElemat: ["$usersTweets", 0]
                    } 
                }
            }
        ])
    
    
        return res.status(200).json(new ApiResponse(200, {"tweets": pipeline}, "users tweets fetched successfully"))
    } catch (error) {
        return res.status(500).json(new ApiResponse(500, null, "Error fetching tweets")); 

    }

})

const updateTweet = asyncHandler(async (req, res) => {
    
    let { tweet_id } = req.params
    let {content} = req.body

    if(!isValidObjectId(tweet_id)){
        throw new ApiError(400, "is not a correct mongodb id")
    }
    
    if(!content){
        throw new ApiError(404, "content is missing")
    }

   try {
    let tweet = await tweetModel.findById(tweet_id)
    let user = await userModel.findById(req.user._id)
  
    if(!tweet || !user){
        throw new ApiError(404, "tweet or user not found")
    }

    if(tweet.content === content){
        throw new ApiError(400, "no updates made in the tweet")
    }

   if(tweet.owner.equals( user._id)){
        tweet.content = content
        const updatedTweet = await tweet.save()
        return res.status(200).json(new ApiResponse(200, {"tweet": updatedTweet},"tweet updated successfully"))
    }else{
        throw new ApiError(403, "unauthorized")
    }
    
    
   } catch (error) {
        console.error("Error updating tweet:", error); // Log the error
        const status = error.status || 500;
        const message = error.message || "Internal Server Error";
        throw new ApiError(status, message);
   }

})

const deleteTweet = asyncHandler(async (req, res) => {
    let {tweet_id} = req.params
    if(!isValidObjectId(tweet_id)){
        throw new ApiError(400, "is not a correct mongodb id")
    }

    let user = await userModel.findById(req.user._id)
    let tweet = await tweetModel.findById(tweet_id)

    if(!user){
        throw new ApiError(404, "user doesnot exist")
    }

    if(!tweet){
        throw new ApiError(404, "tweet doesnot exist")
    }

    if(!tweet.owner.equals(user._id)){
        throw new ApiError(403, "unauthorized")
    }

    await tweet.remove()

    return res.status(200).json(200, "tweet removed successfully")

})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}