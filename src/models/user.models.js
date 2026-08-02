import mongoose, {Schema} from "mongoose"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"


const userSchema = new Schema({
    username:{
        type: String,
        unique: true,
        lowercase: true,
        trim: true,
        required: true,
        index: true           //to enable searching in db
    },
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        lowercase: true
    },
    fullName: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    avatar:{
        type: String, //use cloudinary url for img url
        required: true,
    },
    coverImage: {
        type: String //cloudinary url
    },
    watchHistory: [{
        type: Schema.Types.ObjectId,
        ref: "Video"
    }],
    password: {
        type: String,
        required: [true, 'Password is rqrd']
    },
    refreshToken: {
        type: String
    }
},{timestamps: true})

userSchema.pre("save", async function (){      //do not take () => {} for creating function here as using this will not give access to "this" to access userSchema
    if(!this.isModified("password")) return;   //only encrypt password when creating password or modifying it

    this.password = await bcrypt.hash(this.password, 10);
})

userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateAccessToken = function(){         //access token is expired in short duration
    console.log(process.env.ACCESS_TOKEN_EXPIRY)
    return jwt.sign(
        {   //payload
            _id: this._id,
            email: this.email,
            username: this.username,
            fullName: this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.generateRefreshToken = function(){        //refresh token is expired in long duration
    return jwt.sign(
        {   //payload
            _id: this._id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User = mongoose.model("User",userSchema)