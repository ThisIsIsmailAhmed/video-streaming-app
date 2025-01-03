import mongoose, { Schema } from "mongoose"

const commentSchema = new Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    },
    content: {
        type: String
    },
    video: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "video"
    }
}, { timestamps: true} )

const commentModel = mongoose.model("comment", commentSchema)

export default commentModel