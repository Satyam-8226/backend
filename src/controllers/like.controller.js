import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Like } from "../models/like.model.js";
import { Video } from "../models/video.model.js";
import { Comment } from "../models/comment.model.js";
import { Tweet } from "../models/tweet.model.js";
import mongoose from "mongoose";

const toggleLike = asyncHandler(async (req, res) => {
    const { type, id } = req.params; // type: video, comment, tweet

    if (!["video", "comment", "tweet"].includes(type)) {
        throw new ApiError(400, "Invalid type. Must be video, comment, or tweet");
    }

    if (!mongoose.isValidObjectId(id)) {
        throw new ApiError(400, "Invalid ID");
    }

    let model;
    if (type === "video") model = Video;
    else if (type === "comment") model = Comment;
    else model = Tweet;

    const document = await model.findById(id);
    if (!document) {
        throw new ApiError(404, `${type} not found`);
    }

    const existingLike = await Like.findOne({
        [type]: id,
        likedBy: req.user._id,
    });

    let message;
    if (existingLike) {
        await Like.findByIdAndDelete(existingLike._id);
        message = `${type} unliked successfully`;
    } else {
        await Like.create({
            [type]: id,
            likedBy: req.user._id,
        });
        message = `${type} liked successfully`;
    }

    return res.status(200).json(
        new ApiResponse(200, null, message)
    );
});

export {
    toggleLike,
};