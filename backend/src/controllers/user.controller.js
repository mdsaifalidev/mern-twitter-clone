import User, { sanitizeUser } from "../models/user.model.js";
import Notification from "../models/notification.model.js";
import asyncHandler from "express-async-handler";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { uploadOnCloudinary, deleteOnCloudinary } from "../utils/cloudinary.js";
import fs from "fs";

/**
 * @function getUserProfile
 * @description Get user profile
 * @route GET /api/v1/users/:username
 * @access Private
 */
const getUserProfile = asyncHandler(async (req, res) => {
  const { username } = req.params;

  const user = await User.findOne({ username });
  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  res
    .status(200)
    .json(
      new ApiResponse(
        "User profile retrieved successfully.",
        sanitizeUser(user)
      )
    );
});

/**
 * @function followUnfollowUser
 * @description Follow/Unfollow a user
 * @route POST /api/v1/users/follow/:id
 * @access Private
 */
const followUnfollowUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Prevent self-following
  if (id === req.user._id) {
    throw new ApiError(400, "You cannot follow/unfollow yourself.");
  }

  const user = await User.findById(id);
  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  const isFollowing = req.user.following.includes(id);
  if (isFollowing) {
    // Unfollow the user
    await Promise.all([
      User.findByIdAndUpdate(id, { $pull: { followers: req.user._id } }),
      User.findByIdAndUpdate(req.user._id, { $pull: { following: id } }),
    ]);
  } else {
    // Follow the user
    await Promise.all([
      User.findByIdAndUpdate(id, { $push: { followers: req.user._id } }),
      User.findByIdAndUpdate(req.user._id, { $push: { following: id } }),
    ]);

    // Send notification to the user
    await Notification.create({
      type: "follow",
      from: req.user._id,
      to: id,
    });

    res.status(201).json(new ApiResponse("User followed successfully."));
  }
});

/**
 * @function getSuggestedUsers
 * @description Get suggested users
 * @route GET /api/v1/users/suggested
 * @access Private
 */
const getSuggestedUsers = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // Get users who are not the current user and are not followed by the current user
  const users = await User.aggregate([
    {
      $match: {
        _id: { $ne: userId },
        followers: { $ne: userId },
      },
    },
    { $sample: { size: 10 } },
    { $limit: 4 },
    {
      $project: {
        _id: 1,
        fullName: 1,
        username: 1,
        profileImg: 1,
      },
    },
  ]);

  // Send the suggested users as a JSON response
  res
    .status(200)
    .json(new ApiResponse("Suggested users retrieved successfully.", users));
});

/**
 * @function updateUserProfile
 * @description Update user profile
 * @route PATCH /api/v1/users/update
 * @access Private
 */
const updateUserProfile = asyncHandler(async (req, res, next) => {
  let profileImgLocalPath = null;
  let coverImgLocalPath = null;

  try {
    const {
      fullName,
      email,
      username,
      currentPassword,
      newPassword,
      bio,
      link,
    } = req.body;

    if (req.files.profileImg && req.files.profileImg.length > 0) {
      profileImgLocalPath = req.files.profileImg[0].path;
    }
    if (req.files.coverImg && req.files.coverImg.length > 0) {
      coverImgLocalPath = req.files.coverImg[0].path;
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      throw new ApiError(404, "User not found.");
    }

    if (
      (!newPassword && currentPassword) ||
      (newPassword && !currentPassword)
    ) {
      throw new ApiError(
        400,
        "Please provide both current password and new password."
      );
    }

    if (currentPassword && newPassword) {
      const isPasswordCorrect = await user.isPasswordCorrect(currentPassword);
      if (!isPasswordCorrect) {
        throw new ApiError(400, "Current password is incorrect.");
      }

      user.password = newPassword;
    }

    // Upload images to Cloudinary
    const uploadPromises = [];
    const deletePromises = [];

    if (profileImgLocalPath) {
      if (user.profileImg) {
        const public_id = user.profileImg.split("/").pop().split(".")[0];
        deletePromises.push(deleteOnCloudinary(public_id));
      }
      uploadPromises.push(uploadOnCloudinary(profileImgLocalPath));
    }

    if (coverImgLocalPath) {
      if (user.coverImg) {
        const public_id = user.profileImg.split("/").pop().split(".")[0];
        deletePromises.push(deleteOnCloudinary(public_id));
      }
      uploadPromises.push(uploadOnCloudinary(coverImgLocalPath));
    }

    await Promise.all(deletePromises);

    const [profileImg, coverImg] = await Promise.all(uploadPromises);

    if (profileImgLocalPath && !profileImg) {
      throw new ApiError(500, "Failed to upload profile image to Cloudinary.");
    }
    if (coverImgLocalPath && !coverImg) {
      throw new ApiError(500, "Failed to upload cover image to Cloudinary.");
    }

    if (profileImg) {
      user.profileImg = profileImg.secure_url;
    }
    if (coverImg) {
      user.coverImg = coverImg.secure_url;
    }

    user.fullName = fullName || user.fullName;
    user.email = email || user.email;
    user.username = username || user.username;
    user.bio = bio || user.bio;
    user.link = link || user.link;

    const updatedUser = await user.save();

    res
      .status(200)
      .json(
        new ApiResponse(
          "Profile updated successfully.",
          sanitizeUser(updatedUser)
        )
      );
  } catch (error) {
    next(error);
  } finally {
    // Delete local files after uploading to Cloudinary
    if (profileImgLocalPath && fs.existsSync(profileImgLocalPath)) {
      fs.unlinkSync(profileImgLocalPath);
    }
    if (coverImgLocalPath && fs.existsSync(coverImgLocalPath)) {
      fs.unlinkSync(coverImgLocalPath);
    }
  }
});

export {
  getUserProfile,
  followUnfollowUser,
  getSuggestedUsers,
  updateUserProfile,
};
