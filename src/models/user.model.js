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
        this.password = await bcrypt.hash(this.password, 10)
        next()
    }else{
        next()
    }
})

userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(this.password, password)
}

userSchema.methods.generateAccessTOken = function() {
    return jwt.sign(
        { 
            id : this._id,
            username: this.username,
            fullname : this.fullname,
            email : this.email
        },
        process.env.ACCESS_TOKEN,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}
userSchema.methods.generateRefreshTOken = function name() {
    return jwt.sign(
        { 
            id : this._id
        },
        process.env.REFRESH_TOKEN,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

const user = mongoose.model("user", userSchema)

export default user


/*
[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'post'
        }
    ]
*/            