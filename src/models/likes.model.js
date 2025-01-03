import mongoose, { Schema } from "mongoose"

const likesSchema = new Schema({
    comment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "comment"
    },
    video: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "video"
    },
    likedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    },
    tweet: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "tweet"
    }
}, { timestamps: true })

const likesModel = mongoose.model("like", likesSchema)

export default likesModel