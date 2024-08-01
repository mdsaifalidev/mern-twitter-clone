import { Router } from "express";
import * as notification from "../controllers/notification.controller.js";

const router = Router();

router
  .get("/", notification.getNotifications)
  .delete("/", notification.deleteNotification);

export default router;
