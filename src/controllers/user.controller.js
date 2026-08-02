import {asyncHandler} from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import {User} from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"
import mongoose from "mongoose"

const generateAccessAndRefreshToken = async(userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({validateBeforeSave: false}); // when assigning refereshToken in user model, validateBeforeSave is made false to Skip validation and just save this update.

        return {accessToken, refreshToken};
    } catch (error) {
        console.log(error)
        throw new ApiError(500, "Something went wrong while generating access and refresh token")
    }
}

const registerUser = asyncHandler( async(req, res) => {
    // Steps to register user           
    // get user details from frontend
    // validate details - not empty
    // check if user already exist - username, email
    // check for files - image, avatar
    // upload them to cloudinary, avatar (i think also need to check on cloudinary weather succefully uploaded or not)
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation that it is created
    // return res if succcefully created else error
    // console.log("Content-Type:", req.headers["content-type"]);
    // console.log("Body:", req.body);

    if (!req.body) {
        throw new ApiError(400, "Request body is missing");
    }

    const {username, email, fullName, password} = req.body
    // console.log("email: ", email)   //just to check if we are getting

    //validation
    // if(fullName===""){
    //     throw new ApiError(400, "fullname is required")    //ApiError(statuscode, message)
    // }
    // you can check each and every field by if else on everything or better:
    if([fullName, username, email, password].some((field) => !field || field.trim() === "")){
        throw new ApiError(400, "All field are required")
    }

    //checking if user already exist or not
    const userExist = await User.findOne({         //findOne returns the first user with same field as mentioned (can also use find())
        $or: [{username}, {email}]    //either username is same or email is same
    })

    if(userExist){
        throw new ApiError(409, "Username or email already exist")
    }

    // check for files - image, avatar
    const avatarLocalPath = req.files?.avatar[0]?.path; //avatar[0] means 0th property of avatar and then takes path from that
    
    //const coverImageLocalPath = req.files?.coverImage[0]?.path;
    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length>0){
        coverImageLocalPath = req.files.coverImage[0].path
    }


    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar file is required")
    }

    // upload on cloudinary
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);
    if(!avatar){
        throw new ApiError(400, "Avatar file is required")
    }

    // create user object - create entry in db
    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })

    //checking if user is created (for test purpose)
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"         //these field will not be selected/shown
    )

    if(!createdUser){
        throw new ApiError(500, "Error registering the user!!")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User created successfully")
    )

})

const loginUser = asyncHandler( async(req, res) => {
    // get data from req body
    // get username/email from user
    // find the user in db
    // if user exist then check password
    // generate access and refresh token
    // send cookie

    const {username, email, password} = req.body;
    
    if(!username && !email){
        throw new ApiError(400, "Username or Email is required");
    }

    const user = await User.findOne({    // remember User with capital is from mongoose with we can use functionality in db and user is our user
        $or: [{username},{email}]
    })

    if(!user){
        throw new ApiError(404, "User does not exist")
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if(!isPasswordValid){
        throw new ApiError(401, "Password is incorrect");
    }

    //since generating access and refresh token is repeatedly needed too much therefore we will
    // create a method for that and with help of user (small u) we can easily get userID
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

    //optional step decide if accessing db doesnt put much load
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    } // default cookie is allowed to be changed but by doing this cookie can only be changed through server

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200,
            {
                user: loggedInUser, accessToken, refreshToken
                // why sending token again if already saved in cookie?
                // if user wants to save it in local storage for some reason, maybe he is setting mobile app
                // therefore sending it depends if it is need or not
            },
            "User logged in Successfully"
        )
    )
})

const logoutUser = asyncHandler( async(req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true      //updates the changes
        }
    )

//     httpOnly: true → JavaScript cannot access the cookie 
// (document.cookie can't read it), which helps protect against XSS attacks.
// secure: true → Cookie is only sent over HTTPS.
    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse( 200 , {}, "User logged out successfully"))
})

const refreshAccessToken = asyncHandler( async(req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken //refresh token from user/cookie

    if(!incomingRefreshToken){
        throw new ApiError(401, "Unauthorized request")
    }

    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
    
        const user = await User.findById(decodedToken?._id);
    
        if(!user){
            throw new ApiError(401, "Invalid Refresh Token")
        }
    
        if(incomingRefreshToken !== user.refreshToken){
            throw new ApiError(401, "Refresh Token is expired or used")
        }
    
        const options = {
            httpOnly: true,
            secure: true
        }
    
        const {accessToken, newRefreshToken} = await generateAccessAndRefreshToken(user._id);
    
        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(
            new ApiResponse(
                200,
                {accessToken, refreshToken: newRefreshToken},
                "Access Token Refreshed"
            )
        )
    } catch (error) {
        throw new ApiError(401, error?.message || "Error while refreshing access token")
    }
})

const changePassword = asyncHandler(async(req, res) => {
    const {oldPassword, newPassword} = req.body

    const user = await User.findById(req.user?._id)
    if(!user){  // i added this throw error coz i think it may be necessary
        throw new ApiError(401, "Login to change password")
    }

    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if(!isPasswordCorrect){
        throw new ApiError(400, "Incorrect old password")
    }

    user.password = newPassword

    user.save({validateBeforeSave: false})

    return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"))
})

const getCurrentUser = asyncHandler(async(req,res) => {
    return res
    .status(200)
    .json(new ApiResponse(200, req.user, "Current user fetched successfully"))
})

const updateAccountDetails = asyncHandler(async(req,res) => {
    const {fullName, email} = req.body;

    if(!fullName && !email){
        throw new ApiError(400, "All field are required")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullName,     //either like this or like fullName: fullName
                email
            }
        },
        {new: true}
    ).select("-password -refreshToken")

    return res
    .status(200)
    .json(new ApiResponse(200, user, "Account details updated successfully"))
})

const updateUserAvatar = asyncHandler(async(req, res) => {
    const avatarLocalPath = req.file?.path

    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar file is missing")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath) //returns object containing url

    if(!avatar.url){
        throw new ApiError(400, "Error while uploading avatar on cloudinary")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                avatar: avatar.url
            }
        },
        {new: true}
    ).select("-password -refreshToken")

    //ToDO: delete old avatar image

    return res
    .status(200)
    .json(
        new ApiResponse(200, user, "Avatar image updated successfully")
    )
})

const updateUserCoverImage = asyncHandler(async(req, res) => {
    const coverImageLocalPath = req.file?.path

    if(!coverImageLocalPath){
        throw new ApiError(400, "Cover Image file is missing")
    }

    const coverImage = await uploadOnCloudinary(coverImageLocalPath) //returns object containing url

    if(!coverImage.url){
        throw new ApiError(400, "Error while uploading Cover Image on cloudinary")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                coverImage: coverImage.url
            }
        },
        {new: true}
    ).select("-password -refreshToken")

    return res
    .status(200)
    .json(
        new ApiResponse(200, user, "Cover image updated successfully")
    )
})

const getUserChannelProfile = asyncHandler(async(req,res) => {
    const {username} = req.params   //get username from url

    if(!username?.trim()){
        throw new ApiError(400, "Username is missing")
    }

    //we will use aggregation pipeline to get user channel profile with all the details like total subscribers, total videos, total views etc
    // aggregation pipeline is a framework for data aggregation modeled on the concept of data processing pipelines. Documents enter a multi-stage pipeline that transforms the documents into aggregated results.
    // it is used in mongoose and mongodb to perform complex data processing and analysis tasks on collections of documents. It allows you to process and transform data in a series of stages, where each stage performs a specific operation on the input documents and passes the results to the next stage.
    const channel = await User.aggregate([
        {
            $match: {
                username: username?.toLowerCase()
            }
        },
        //lookup to find number of subscribers subsribed to the channel, we will count number of documents in subscriptions collection where channel is equal to the user _id
        {
            $lookup: {
                from: "subscriptions",   //in db names are stored in lowercase and in plural
                localField: "_id",    //select _id from subscription collection and match with channel field in subscription collection
                foreignField: "channel",  // left join with channel field in subscription collection
                as: "subscribers"  //name of the new field that will be added to the output documents, which will contain an array of matching documents from the subscriptions collection
            }
        },
        //lookup to find number of channels you are subscribed to, we will count number of documents in subscriptions collection where subscriber is equal to the user _id
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedChannels"
            }
        },
        // now we will use addFields to add new fields to the output documents, which will contain the counts of subscribers and subscribed channels
        {
            $addFields: {
                subscribersCount: {$size: "$subscribers"},  //$ ise used before subscribers coz it is a field in the output document and we are using size operator to get the number of elements in the array
                subscribedChannelsCount: {$size: "$subscribedChannels"},  //size operator returns the number of elements in the array
                isSubscribed: {
                    $cond: {
                        // $in is used for both array and object and it checks if the first argument is present in the second argument or not, if present then true else false
                        if: {$in: [req.user?._id, "$subscribers.subscriber"]},  //if user is logged in and his _id is in the subscribers array then true else false
                        then: true,
                        else: false
                    }
                }
            }
        },
        {   // $project is used to include specific fields in the output and exclude others, we will include only the fields that we want to send to the frontend
            $project: {
                fullName: 1,
                username: 1,
                avatar: 1,
                coverImage: 1,
                email: 1,
                subscribersCount: 1,
                subscribedChannelsCount: 1,
                isSubscribed: 1
            }
        }

    ])

    if(!channel?.length){
        throw new ApiError(404, "Channel does not exist")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, channel[0], "User channel fetched successfully")
    )
})

const getWatchHistory = asyncHandler(async(req, res) => {
    const user = await User.aggregate([
        {
            $match: {
                // in aggregation pipeline we cant use req.user._id directly because it is not a field in the collection, we need to convert it to ObjectId using mongoose.Types.ObjectId
                // other than aggregation pipeline mongoose automatically converts string to ObjectId but in aggregation pipeline we need to do it manually
                _id: new mongoose.Types.ObjectId(req.user?._id)
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                pipeline: [
                    { // we will use pipeline to get only the required fields from the videos collection and also get the owner details from the users collection
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        fullName: 1,
                                        username: 1,
                                        avatar: 1
                                    }
                                }
                            ]
                        }
                    },
                    {     //not necessary to add this pipeline but it makes easier for frontend to get the owner details directly without going through the array, because owner is an array of one element, we will use $first to get the first element of the array
                        $addFields: {
                            // apply the change to owner itself
                            owner: { $first: "$owner" }  // $first is used to get the first element of the array, because owner is an array of one element, we need to get the first element of the array to get the owner details
                        }
                    }
                ]
            }
        }
    ])

    return res
    .status(200)
    .json(
        new ApiResponse(200, user[0]?.getWatchHistory, "User watch history fetched successfully")
    )
})

export { 
    registerUser , 
    loginUser , 
    logoutUser, 
    refreshAccessToken , 
    changePassword , 
    getCurrentUser , 
    updateAccountDetails, 
    updateUserCoverImage, 
    updateUserAvatar,
    getUserChannelProfile,
    getWatchHistory
}