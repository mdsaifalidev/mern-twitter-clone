import Notification from "../models/notification.model.js";
import asyncHandler from "express-async-handler";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";

/**
 * @function getNotifications
 * @description Get notifications
 * @route GET /api/v1/notifications
 * @access Private
 */
const getNotifications = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const notification = await Notification.find({ to: userId }).populate({
    path: "from",
    select: "username profileImg",
  });

  await Notification.updateMany({ to: userId, read: false }, { read: true });

  res
    .status(200)
    .json(
      new ApiResponse("Notifications retrieved successfully.", notification)
    );
});

/**
 * @function deleteNotification
 * @description Delete notifications
 * @route DELETE /api/v1/notifications
 * @access Private
 */
const deleteNotification = asyncHandler(async (req, res) => {
  await Notification.deleteMany({ to: req.user._id });

  res.status(200).json(new ApiResponse("Notifications deleted successfully."));
});

export { getNotifications, deleteNotification };
