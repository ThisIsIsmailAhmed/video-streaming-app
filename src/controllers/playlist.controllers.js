import mongoose, {isValidObjectId} from "mongoose"
import { playListModel } from "../models/playlist.model.js"
import { ApiError } from "../utils/apiError.js"
import { ApiResponse } from "../utils/apiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { isValidObjectId } from "mongoose"


const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body

    let owner = req.user._id

    const playlist = await playListModel.create({
        name,
        description,
        owner
    })

    await playlist.save()

})

const getUserPlaylists = asyncHandler(async (req, res) => {
    
    const { userId } = req.params

    if(!isValidObjectId(userId)){
        throw new ApiError(401, "is not a correct userId")
    }


    const pipeline = playListModel.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId)
            },
        },
        {
            $lookup: {
                from: "videos",
                localField: "videos",
                foreignField: "_id",
                as: "videosInsidePlaylist",
                pipeline: {
                    $lookup: {
                        from: "users",
                        localField: "owner",
                        foreignField: "_id",
                        as: "videoOwner",
                        pipeline: [
                           {
                            $project: {
                             fullname: 1,
                             avatar: 1,
                             username: 1   
                            }
                           }
                        ]
                    }
                }
            },
        },
        {
            $addField: {
               $first: "$videoOwner"
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "createdBy",
                pipeline: {
                    $project: {
                        avatar: 1,
                        username: 1,
                        fullname: 1
                    }
                }
            }
        },
        {
            $addField: {
                createdBy: {
                    $first: $createdBy
                }
            }
        }
    ])

    

    if(!pipeline){
        throw new ApiError(401, "no Playlists found")
    }

})

const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;
  
    if (!isValidObjectId(playlistId)) {
      throw new ApiError(400, "Playlist ID is not valid"); 
    }
  
    const playList = await playListModel.findById(playlistId);
  
    if (!playList) {
      throw new ApiError(404, "Playlist does not exist");
    }
  
    return res.status(200).json(
      new ApiResponse(200, { playlist: playList }, "Playlist sent successfully")
    );
  });

  const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params;
  
    if(!isValidObjectId(playlistId)){
        throw new ApiError(400, "invalid playlist id")
    }

    if(!isValidObjectId(videoId)){
        throw new ApiError(400, "invalid video id")
    }
    
    const playlist = await playListModel.findByIdAndUpdate(
      playlistId,
      { $push: { videos: videoId } },
      { new: true }
    );
  
    if (!playlist) {
      throw new ApiError(404, "Playlist not found");
    }
  
    res.status(200).json( new ApiResponse(200, {playlist}, "video added to playlist successfully") );
  });

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params

    if(!isValidObjectId(playlistId)){
        throw new ApiError(400, "invalid playlist id")
    }

    if(!isValidObjectId(videoId)){
        throw new ApiError(400, "invalid video id")
    }

    let playlist = await playListModel.findById(playlistId)

    if(!playlist){
        throw new ApiError(400, "playlist dosenot exists")
    }

    let updatedPlaylist = await playlist.update({
        $pull : {videos: videoId} 
    }, {new: true})

    return res.status(200).json(new ApiResponse(200, { playlist: updatedPlaylist }, "video deleted successfully"))
    
})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    
    if(!isValidObjectId(playlistId)){
        throw new ApiError(400, "not a valid playlist id")
    }

    const deletedPlaylist = await playListModel.findByIdAndRemove(playlistId)

    if(!deletedPlaylist){
        throw new ApiError(404, "playlist not deleted")
    }

    return res.status(200).json(new ApiResponse(200, "playlist deleted successfully"))

})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body


    
    if(!isValidObjectId(playlistId)){
        throw new ApiError(400, "not a valid playlist id")
    }

    let updatedPlaylist = {}

    if(name){
        updatedPlaylist.name = name
    }

    if(description){
        updatedPlaylist.description = description
    }
    
    let playlist = await playListModel.findByIdAndUpdate(playlistId, {
        $set: {updatedPlaylist}
    }, {new: true, runVaidators: true})

   return res.status(200).json(new ApiResponse(200, {playlist}, "playlist updated successfully"))


})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}