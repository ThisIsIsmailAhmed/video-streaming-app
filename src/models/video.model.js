import mongoose from "mongoose"
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2"

const videoSchema = new mongoose.Schema({
    thumbnail: {
        type: String,   //cloudinary url
        required: true
    },
    videoFile: {
        type: String,  //cloudinary url
        required: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    duration: {
        type: Number,
        required: true
    },
    views: {
        type: Number,
        default: 0
    },
    isPublished: {
        type: Boolean,
        default: true
    }
},{timestamps: true})

videoModel.plugin(mongooseAggregatePaginate)

const videoModel = mongoose.model("video", videoSchema)

export default videoModel