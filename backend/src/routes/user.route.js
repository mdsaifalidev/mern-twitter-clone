import { Router } from "express";
import * as user from "../controllers/user.controller.js";
import upload from "../middlewares/multer.middleware.js";
import validate from "../middlewares/validation.middleware.js";
import * as validation from "../validations/user.validation.js";

const router = Router();

router
  .get("/profile/:username", user.getUserProfile)
  .post("/follow/:id", user.followUnfollowUser)
  .get("/suggested", user.getSuggestedUsers)
  .post(
    "/update",
    upload.fields([
      {
        name: "profileImg",
        maxCount: 1,
      },
      {
        name: "coverImg",
        maxCount: 1,
      },
    ]),
    validate(validation.updateUserProfileSchema),
    user.updateUserProfile
  );

export default router;
