import mongoose, { Schema } from "mongoose"
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2"

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

commentSchema.plugin(mongooseAggregatePaginate)

const commentModel = mongoose.model("comment", commentSchema)

export default commentModel