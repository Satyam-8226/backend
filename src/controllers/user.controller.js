import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async (req, res) => {
    // get user details from frontend
    // validate user details - not empty
    // check if user already exists
    // check for images, check for avatar
    // upload images to cloudinary, get the urls
    // create user in database with the details and the urls of the images
    // remove password and refresh token from the response
    // check for user creation success, send response to frontend


    const {fullName, email, username, password} = req.body
    console.log("email: ", email);

    if(fullName === "" || email === "" || username === "" || password === "") {
        throw new ApiError(400, "All fields are required");
    }

    const existedUser = User.findOne({
        $or: [{ username } ,{ email }]
    })

    if(existedUser) {
        throw new ApiError(409, "User already exists with the given email or username");
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;

    if(!avatarLocalPath) {
        throw new ApiError(400, "Avatar image is required");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if(!avatar) {
        throw new ApiError(500, "Could not upload avatar image, please try again");
    }

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        username : username.toLowerCase(),
        password
    });

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    if(!createdUser) {
        throw new ApiError(500, "User could not be created, please try again");
    }

    return res.status(201).json(
        new ApiResponse(201, createdUser, "User registered successfully")
    );

});

export { registerUser };