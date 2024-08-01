import multer from "multer";
import ApiError from "../utils/ApiError.js";
import path from "path";

const MAX_FILE_SIZE = 1024 * 1024 * 5; // 5MB
const __dirname = path.resolve();
const UPLOAD_PATH = path.join(__dirname, "backend/public/temp");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_PATH);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

/**
 * @function fileFilter
 * @description Filter files by allowed file types
 * @param {Array} allowedMimes - Array of allowed file types
 */
const fileFilter = (allowedMimes) => (req, file, cb) => {
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new ApiError(
        400,
        "Invalid file type. Only JPEG, JPG and PNG files are allowed."
      )
    );
  }
};

const allowedMimes = ["image/jpeg", "image/jpg", "image/png"];

const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: fileFilter(allowedMimes),
});

export default upload;
