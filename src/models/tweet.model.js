import mongoose, { Schema } from "mongoose"

const tweetSchema = new Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    },
    content: {
        type: String
    }
}, { timestamps: true} )

const tweetModel = mongoose.model("tweet", tweetSchema)

export default tweetModel