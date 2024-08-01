import Post from "../models/post.model.js";
import User from "../models/user.model.js";
import Notification from "../models/notification.model.js";
import asyncHandler from "express-async-handler";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { uploadOnCloudinary, deleteOnCloudinary } from "../utils/cloudinary.js";
import fs from "fs";

/**
 * @function createPost
 * @description Create a new post
 * @route POST /api/v1/posts
 * @access Private
 */
const createPost = asyncHandler(async (req, res, next) => {
  let imgLocalPath = "";
  try {
    const { text } = req.body;

    imgLocalPath = req.file?.path;
    if (!imgLocalPath) {
      throw new ApiError(400, "Please upload an image.");
    }

    const img = await uploadOnCloudinary(imgLocalPath);

    const newPost = await Post.create({
      user: req.user._id,
      text,
      img: img.secure_url,
    });

    res
      .status(201)
      .json(new ApiResponse("Post created successfully.", newPost));
  } catch (error) {
    next(error);
  } finally {
    if (imgLocalPath && fs.existsSync(imgLocalPath)) {
      fs.unlinkSync(imgLocalPath);
    }
  }
});

/**
 * @function deletePost
 * @description Delete a post
 * @route DELETE /api/v1/posts/:id
 * @access Private
 */
const deletePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) {
    throw new ApiError(404, "Post not found.");
  }

  if (post.user.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to delete this post.");
  }

  if (post.img) {
    const public_id = post.img.split("/").pop().split(".")[0];
    const img = await deleteOnCloudinary(public_id);
    if (!img) {
      throw new ApiError(500, "Failed to delete post.");
    }
  }

  await Post.findByIdAndDelete(req.params.id);

  res.status(200).json(new ApiResponse("Post deleted successfully."));
});

/**
 * @function commentOnPost
 * @description Comment on a post
 * @route POST /api/v1/posts/:id/comment
 * @access Private
 */
const commentOnPost = asyncHandler(async (req, res) => {
  const { text } = req.body;

  const post = await Post.findById(req.params.id);
  if (!post) {
    throw new ApiError(404, "Post not found.");
  }

  post.comments.push({
    user: req.user._id,
    text,
  });

  await post.save();

  res.status(200).json(new ApiResponse("Comment added successfully.", post));
});

/**
 * @function likeUnlikePost
 * @description Like or unlike a post
 * @route POST /api/v1/posts/:id/like
 * @access Private
 */
const likeUnlikePost = asyncHandler(async (req, res) => {
  const { id: postId } = req.params;
  const userId = req.user._id;
  let updatedLikes = [];

  const post = await Post.findById(postId);
  if (!post) {
    throw new ApiError(404, "Post not found.");
  }

  const isLiked = post.likes.includes(userId);
  if (isLiked) {
    // Unlike the post
    await Promise.all([
      Post.updateOne({ _id: postId }, { $pull: { likes: userId } }),
      User.updateOne({ _id: userId }, { $pull: { likedPosts: postId } }),
    ]);

    updatedLikes = post.likes.filter((id) => id.toString() !== userId);
  } else {
    // Like the post
    post.likes.push(userId);
    await Promise.all([
      post.save(),
      User.updateOne({ _id: userId }, { $push: { likedPosts: postId } }),
    ]);

    await Notification.create({
      type: "like",
      from: userId,
      to: post.user,
    });

    updatedLikes = post.likes;
  }

  res
    .status(200)
    .json(
      new ApiResponse(
        `Post ${isLiked ? "unliked" : "liked"} successfully.`,
        updatedLikes
      )
    );
});

/**
 * @function getAllPosts
 * @description Get all posts
 * @route GET /api/v1/posts
 * @access Private
 */
const getAllPosts = asyncHandler(async (req, res) => {
  const posts = await Post.find()
    .sort({ createdAt: -1 })
    .populate({
      path: "user",
      select: "username fullName profileImg",
    })
    .populate({
      path: "comments.user",
      select: "username fullName profileImg",
    });

  res
    .status(200)
    .json(new ApiResponse("All posts retrieved successfully.", posts));
});

/**
 * @function getUserPosts
 * @description Get all posts by a user
 * @route GET /api/v1/posts/user/:id
 * @access Private
 */
const getLikedPosts = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  const posts = await Post.find({ _id: { $in: user.likedPosts } })
    .populate({
      path: "user",
      select: "username fullName profileImg",
    })
    .populate({
      path: "comments.user",
      select: "username fullName profileImg",
    });

  res
    .status(200)
    .json(new ApiResponse("Liked posts retrieved successfully.", posts));
});

/**
 * @function getFollowingPosts
 * @description Get posts by users that the current user is following
 * @route GET /api/v1/posts/following
 * @access Private
 */
const getFollowingPosts = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  const posts = await Post.find({ user: { $in: user.following } })
    .sort({ createdAt: -1 })
    .populate({
      path: "user",
      select: "username fullName profileImg",
    })
    .populate({
      path: "comments.user",
      select: "username fullName profileImg",
    });

  res
    .status(200)
    .json(new ApiResponse("Following posts retrieved successfully.", posts));
});

/**
 * @function getUserPosts
 * @description Get all posts by a user
 * @route GET /api/v1/posts/user/:username
 * @access Private
 */
const getUserPosts = asyncHandler(async (req, res) => {
  const { username } = req.params;

  const user = await User.findOne({ username });
  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  const posts = await Post.find({ user: user._id })
    .sort({ createdAt: -1 })
    .populate({
      path: "user",
      select: "username fullName profileImg",
    })
    .populate({
      path: "comments.user",
      select: "username fullName profileImg",
    });

  res
    .status(200)
    .json(new ApiResponse("User posts retrieved successfully.", posts));
});

export {
  createPost,
  deletePost,
  commentOnPost,
  likeUnlikePost,
  getAllPosts,
  getLikedPosts,
  getFollowingPosts,
  getUserPosts,
};
