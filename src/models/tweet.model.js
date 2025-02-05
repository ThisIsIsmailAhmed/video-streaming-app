import mongoose, { Schema } from "mongoose"
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2"

const tweetSchema = new Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    },
    content: {
        type: String
    }
}, { timestamps: true} )


tweetModel.plugin(mongooseAggregatePaginate)

const tweetModel = mongoose.model("tweet", tweetSchema)


export default tweetModel