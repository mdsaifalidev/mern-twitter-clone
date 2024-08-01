import { Router } from "express";
import * as auth from "../controllers/auth.controller.js";
import passport from "passport";
import verifyJwt from "../middlewares/auth.middleware.js";
import validate from "../middlewares/validation.middleware.js";
import * as validation from "../validations/auth.validation.js";

const router = Router();

router
  .post("/signup", validate(validation.userSignupSchema), auth.signupUser)
  .post(
    "/login",
    validate(validation.userLoginSchema),
    passport.authenticate("local"),
    auth.loginUser
  )
  .post("/logout", verifyJwt, auth.logoutUser)
  .post("/refresh-token", auth.refreshAccessToken)
  .get("/current-user", verifyJwt, auth.getCurrentUser)
  .post(
    "/reset-password-request",
    validate(validation.resetPasswordRequestSchema),
    auth.resetPasswordRequest
  )
  .post(
    "/reset-password/:resetPasswordToken",
    validate(validation.resetPasswordSchema),
    auth.resetPassword
  );

export default router;
