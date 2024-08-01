import passport from "passport";
import ApiError from "../utils/ApiError.js";

/**
 * @middleware verifyJwt
 * @description Middleware for verifying JWT token
 */
const verifyJwt = (req, res, next) => {
  passport.authenticate("jwt", { session: false }, (error, user) => {
    if (error) {
      return next(error);
    }

    if (!user) {
      // User not authenticated, send a 403 Forbidden status code
      throw new ApiError(
        403,
        "Access Forbidden. Token may be expired or invalid."
      );
    }
    // User is authenticated, proceed to the next middleware
    req.user = user;
    next();
  })(req, res, next);
};

export default verifyJwt;
