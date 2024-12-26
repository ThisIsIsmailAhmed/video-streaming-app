import mongoose from "mongoose"


const subscriptionSchema = new mongoose.Schema({
     subscriber : {
        type: mongoose.Types.ObjectId,
        ref: "user"
     },
     channel : {
        type: mongoose.Types.ObjectId,
        ref: "user"
     }
},{timestamps: true})

export const subscriptionModel = mongoose.model("subscription", subscriptionSchema)