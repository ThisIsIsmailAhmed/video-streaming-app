import mongoose, {isValidObjectId} from "mongoose"
import {ApiError} from "../utils/apiError.js"
import {ApiResponse} from "../utils/apiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import commentModel from "../models/comments.model.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query

})

const addComment = asyncHandler(async (req, res) => {
    let { videoId } = req.params
    let { content } = req.body

    if (!isValidObjectId(videoId)){
        throw new ApiError(400, "not a valid mongoose id")
    }
 
    try {
        let comment = await commentModel.create({
            content,
            owner: req.user._id,
            video: videoId
        })
        return res.status(200).json(200, {"comment": comment}, "comment created successfully")
    } catch (error) {
        console.error(error)
        let staus = error.staus || error.stausCode || 500
        let message = error.message || "something went wrong"
        throw new ApiError(staus, message)
    }

})

const updateComment = asyncHandler(async (req, res) => {
    let { commentId } = req.params
    let { content } = req.body
    
    if (!isValidObjectId(commentId)){
        throw new ApiError(400, "not a valid mongoose id")
    }
    
    if(!content){
        throw new ApiError(404, "content is missing")
    }
    
    let comment = await commentModel.findById(commentId)

    if(!comment){
        throw new ApiError(400, "comment doesnot exist")
    }

    if(!comment.owner.equals(req.user._id)){
        throw new ApiError(403, "you are unauthorized to update the comment")
    }

    if (comment.content.trim().toLowerCase() === content.trim().toLowerCase()){
        throw new ApiError(400, "no changes are made")
    }

    comment.content = content

    await comment.save()

})

const deleteComment = asyncHandler(async (req, res) => {
    let { commentId } = req.params
    
    if (!isValidObjectId(commentId)){
        throw new ApiError(400, "not a valid mongoose id")
    }
    
    let comment = await commentModel.findById(commentId)

    if(!comment){
        throw new ApiError(404, "comment doesnot exist")
    }

    if(!comment.owner.equals(req.user._id)){
        throw new ApiError(403, "you are unauthorized to update the comment")
    }

        try {
            await comment.deleteOne()
        } catch (error) {
            console.error(error)
            let staus = error.staus || error.stausCode || 500
            let message = error.message || "something went wrong"
            throw new ApiError(staus, message)
        }
    

})


export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }