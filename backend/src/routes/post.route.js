import { Router } from "express";
import * as post from "../controllers/post.controller.js";
import upload from "../middlewares/multer.middleware.js";
import validate from "../middlewares/validation.middleware.js";
import * as validation from "../validations/post.validation.js";

const router = Router();

router
  .get("/all", post.getAllPosts)
  .get("/following", post.getFollowingPosts)
  .get("/likes/:id", post.getLikedPosts)
  .get("/user/:username", post.getUserPosts)
  .post(
    "/",
    upload.single("img"),
    validate(validation.createPost),
    post.createPost
  )
  .post("/like/:id", post.likeUnlikePost)
  .post("/comment/:id", validate(validation.createPost), post.commentOnPost)
  .delete("/:id", post.deletePost);

export default router;
