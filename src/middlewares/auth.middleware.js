import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import User from "../models/User.js";


export const verifyJWT = asyncHandler(async (req, _, next) => {
    try {
        const token = req.cookies?.accessToken || req.headers("authorization")?.replace("Bearer ", "");
    
        if(!token) {
            throw new ApiError(401, "Unauthorized: No token provided");
        }
    
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    
        const user = await User.findById(decodedToken._id).select("-password -refreshToken")
    
        if(!user) {
            throw new ApiError(401, "Unauthorized: User not found");
        }
    
        req.user = user;
        next();
    } catch (error) {
        throw new ApiError(401, error?.message || "Unauthorized: Invalid token");
    }
});
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import User from "../models/User.js";


export const verifyJWT = asyncHandler(async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.headers("authorization")?.replace("Bearer ", "");
    
        if(!token) {
            throw new ApiError(401, "Unauthorized: No token provided");
        }
    
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    
        const user = await User.findById(decodedToken._id).select("-password -refreshToken")
    
        if(!user) {
            throw new ApiError(401, "Unauthorized: User not found");
        }
    
        req.user = user;
        next();
    } catch (error) {
        throw new ApiError(401, error?.message || "Unauthorized: Invalid token");
    }
});