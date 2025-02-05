import mongoose, { Schema } from "mongoose"

const playListSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String,
    },
    videos:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "video"
        }
    ],
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    }
}, { timestamps: true })

const playListModel = mongoose.model("playList", playListSchema)

export default playListModel