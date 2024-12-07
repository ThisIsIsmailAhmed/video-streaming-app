import mongoose from "mongoose"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        minlength: [3, "Username should have a minimum length of 3 characters"],
        unique: true,
        required: true,
        index: true,
        trim: true,
        lowercase: true
    },
    email: {
        type: String, 
        unique: true,
        required: true,
        trim: true,
        lowercase: true
    },
    fullname: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        index: true
    },
    avatar: {
        type: String,   //cloudinary url
        required: true,
    },
    coverImage: {
       type: String,
    },
    watchHistory: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "video"
    }],
    password: {
        type: String,
        required: [true, "password is requied"]
    },
    refreshToken: {
        type: String,
    }
}, {timestamps: true})

userSchema.pre("save", async function(next){
    if(isModified("password")){
        this.password = bcrypt.hash(this.password, 10)
        next()
    }
})

export const user = mongoose.model("user", userSchema)


/*
[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'post'
        }
    ]
*/            