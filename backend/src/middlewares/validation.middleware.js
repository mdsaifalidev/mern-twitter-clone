import asyncHandler from "express-async-handler";
import ApiError from "../utils/ApiError.js";

/**
 * @middleware validate
 * @description Middleware for validating request body
 */
const validate = (schema) =>
  asyncHandler(async (req, res, next) => {
    try {
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (error) {
      const message = error.errors[0]?.message;
      throw new ApiError(409, message);
    }
  });

export default validate;
