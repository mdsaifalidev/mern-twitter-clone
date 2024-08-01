import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } =
  process.env;

// Configure Cloudinary
cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
});

/**
 * @function uploadOnCloudinary
 * @description Upload image to Cloudinary
 * @param {string} localFilePath - Local file path
 * @returns {Promise<object>} Cloudinary response
 */
const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
    // Upload image to Cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      folder: "twitter",
      resource_type: "image",
    });
    return response;
  } catch (error) {
    return null;
  }
};

/**
 * @function deleteOnCloudinary
 * @description Delete image from Cloudinary
 * @param {string} public_id - Public ID
 * @returns {Promise<boolean>} Cloudinary response
 */
const deleteOnCloudinary = async (public_id) => {
  try {
    if (!public_id) return false;
    const response = await cloudinary.uploader.destroy(public_id, {
      resource_type: "image",
    });
    return true;
  } catch (error) {
    return false;
  }
};

export { uploadOnCloudinary, deleteOnCloudinary };
