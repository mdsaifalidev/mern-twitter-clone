import ApiError from "../utils/ApiError.js";

/**
 * @middleware errorHandler
 * @description Middleware for handling errors
 */
const errorHandler = (err, req, res, next) => {
  if (err instanceof ApiError) {
    return res
      .status(err.statusCode)
      .json({ success: err.success, message: err.message });
  } else {
    return res.status(500).json({
      success: err.success,
      message: "Internal server error.",
      stack: process.env.NODE_ENV === "development" ? err.stack : null,
    });
  }
};

export default errorHandler;
