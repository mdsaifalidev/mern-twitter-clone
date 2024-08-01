import User from "../models/user.model.js";
import asyncHandler from "express-async-handler";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import ms from "ms";
import jwt from "jsonwebtoken";
import sendEmail from "../utils/email.js";
import crypto from "crypto";

const cookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: "strict",
};

/**
 * @function generateAccessAndRefreshTokens
 * @description Generate access and refresh tokens
 * @param {String} userId - The user ID
 * @returns {Object} - The access and refresh tokens
 */
const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save();

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Failed to generate access and refresh tokens.");
  }
};

/**
 * @function signupUser
 * @description Signup a new user
 * @route POST /api/v1/auth/signup
 * @access Public
 */
const signupUser = asyncHandler(async (req, res) => {
  const { fullName, username, email, password } = req.body;

  // Check if the username already exist
  const existedUsername = await User.findOne({ username });
  if (existedUsername) {
    throw new ApiError(400, "Username already exists.");
  }

  // Check if the email already exists
  const existedEmail = await User.findOne({ email });
  if (existedEmail) {
    throw new ApiError(400, "Email already exists.");
  }

  // Create a new user
  await User.create({
    fullName,
    username,
    email,
    password,
  });

  res.status(201).json(new ApiResponse("User registered successfully."));
});

/**
 * @function loginUser
 * @description Login a user
 * @route POST /api/v1/auth/login
 * @access Public
 */
const loginUser = asyncHandler(async (req, res) => {
  // Generate access and refresh tokens
  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    req.user._id
  );

  const { ACCESS_TOKEN_EXPIRY, REFRESH_TOKEN_EXPIRY } = process.env;

  res
    .status(200)
    .cookie("accessToken", accessToken, {
      ...cookieOptions,
      expires: new Date(Date.now() + ms(ACCESS_TOKEN_EXPIRY)),
    })
    .cookie("refreshToken", refreshToken, {
      ...cookieOptions,
      expires: new Date(Date.now() + ms(REFRESH_TOKEN_EXPIRY)),
    })
    .json(new ApiResponse("User logged in successfully.", req.user));
});

/**
 * @function logoutUser
 * @description Logout a user
 * @route POST /api/v1/auth/logout
 * @access Private
 */
const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: { refreshToken: 1 }, // this removes the field from document
    },
    { new: true }
  );
  res
    .status(200)
    .clearCookie("accessToken")
    .clearCookie("refreshToken")
    .json(new ApiResponse("User logged out successfully."));
});

/**
 * @function refreshAccessToken
 * @description Refresh the access token
 * @route POST /api/v1/auth/refresh-token
 * @access Public
 */
const refreshAccessToken = asyncHandler(async (req, res, next) => {
  try {
    const { incomingRefreshToken } = req.cookies;

    if (!incomingRefreshToken) {
      throw new ApiError(401, "Unauthorized request.");
    }

    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken._id);
    if (!user) {
      throw new ApiError(401, "Unauthorized request.");
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Unauthorized request.");
    }

    // Generate access and refresh tokens
    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
      user._id
    );

    const { ACCESS_TOKEN_EXPIRY, REFRESH_TOKEN_EXPIRY } = process.env;

    res
      .status(200)
      .cookie("accessToken", accessToken, {
        ...cookieOptions,
        expires: new Date(Date.now() + ms(ACCESS_TOKEN_EXPIRY)),
      })
      .cookie("refreshToken", refreshToken, {
        ...cookieOptions,
        expires: new Date(Date.now() + ms(REFRESH_TOKEN_EXPIRY)),
      })
      .json(new ApiResponse("Access token refreshed."));
  } catch (error) {
    if (jwt.JsonWebTokenError) {
      throw new ApiError(401, "Unauthorized request.");
    } else {
      next(error);
    }
  }
});

/**
 * @function getCurrentUser
 * @description Get the current user
 * @route GET /api/v1/auth/current-user
 * @access Private
 */
const getCurrentUser = asyncHandler(async (req, res) => {
  res.status(200).json(new ApiResponse("User fetched successfully.", req.user));
});

/**
 * @function resetPasswordRequest
 * @description Request to reset the password
 * @route POST /api/v1/auth/reset-password-request
 * @access Public
 */
const resetPasswordRequest = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(404, "User does not exist.");
  }

  // Generate reset password token
  const resetPasswordToken = user.generateResetPasswordToken();
  await user.save();

  // Send the reset password email
  const resetPasswordUrl = `${process.env.CORS_ORIGIN}/reset-password/${resetPasswordToken}`;
  const options = {
    email,
    subject: "Reset Password",
    message: `
      Hi ${user.fullName},<br />
      You requested to reset your password. <br />
      Please, click the link below to reset your password.<br />
      <a href=${resetPasswordUrl}>Reset Password</a>
    `,
  };

  const send = await sendEmail(options);
  if (!send) {
    throw new ApiError(500, "Failed to send the reset password email.");
  }

  res.status(200).json(new ApiResponse("Reset password email sent."));
});

/**
 * @function resetPassword
 * @description Reset the password
 * @route PATCH /api/v1/auth/reset-password/:resetPasswordToken
 * @access Public
 */
const resetPassword = asyncHandler(async (req, res) => {
  const { resetPasswordToken } = req.params;
  const { newPassword } = req.body;

  // hashed reset password token
  const hashedResetPasswordToken = crypto
    .createHash("sha256")
    .update(resetPasswordToken)
    .digest("hex");

  // Find user with the reset password token
  const user = await User.findOne({
    resetPasswordToken: hashedResetPasswordToken,
    resetPasswordTokenExpiry: { $gt: Date.now() },
  });
  if (!user) {
    throw new ApiError(400, "Invalid or expired reset password token.");
  }

  user.password = newPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordTokenExpiry = undefined;
  await user.save();

  res.status(200).json(new ApiResponse("Password reset successfully."));
});

export {
  signupUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  getCurrentUser,
  resetPasswordRequest,
  resetPassword,
};
