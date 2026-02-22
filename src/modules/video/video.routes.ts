import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { uploadVideo } from "../../config/multer";
import {
  addVideoToChannel,
  getChannelVideos,
} from "./video.controller";

const router = Router();

router.post(
  "/",
  authenticate,
  uploadVideo.fields([
    { name: "video", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
  ]),
  addVideoToChannel
);

router.get("/channel/:channelId", getChannelVideos);

export default router;
