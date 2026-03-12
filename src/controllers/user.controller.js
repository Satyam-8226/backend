import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const generatedAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
        
    } catch (error) {
        throw new ApiError(500, "Could not generate tokens, please try again");
    }
}

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
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;

    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path;
    }

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

const loginUser = asyncHandler(async (req, res) => {
    // get data from request body
    // validate data - not empty
    // username or email based login - check if email or username is provided
    // check if user exists with the given email or username
    // if user does not exist, send error response to frontend
    // if user exists, compare the password with the hashed password in the database
    // if password does not match, send error response to frontend
    // if password matches, generate access token and refresh token
    // save refresh token in database for the user
    // send access token and refresh token in response to frontend

    const { email, username, password } = req.body;

    if((!email && !username) || !password) {
        throw new ApiError(400, "Email or username and password are required");
    }

    const user = User.findOne({
        $or: [{ email }, { username: username?.toLowerCase() }]
    })

    if(!user) {
        throw new ApiError(404, "User not found with the given email or username");
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if(!isPasswordValid) {
        throw new ApiError(401, "Invalid password");
    }

    const {accessToken, refreshToken} =  await generatedAccessAndRefreshToken(user._id);

    const loggedInUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    const options = {
        httpOnly: true,
        secure: true,
    }

    return res.status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200,
            {
                refreshToken, accessToken, user: loggedInUser
            },
            "User logged in successfully"
        )
    );
})

const logoutUser = asyncHandler(async (req, res) => {
    // get user id from req.user
    // find the user in database using the id
    // if user not found, send error response to frontend
    // if user found, remove the refresh token from database
    // send success response to frontend

    User.findByIdAndUpdate(
        req.user._id,
        {
            $set: { refreshToken: undefined }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true,
    }

    return res.status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(
        new ApiResponse(
            200,
            null,
            "User logged out successfully"
        )
    );

});

export {
    registerUser,
    loginUser,
    logoutUser
};