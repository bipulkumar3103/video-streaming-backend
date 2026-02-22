import { Response } from "express";
import { AuthRequest } from "../../middlewares/auth.middleware";
import { asyncHandler } from "../../common/utils/asyncHandler";
import { AppError } from "../../common/errors/AppError";
import {
  addVideoToChannelService,
  getChannelVideosService,
} from "./video.service";
import { uploadVideoThumbnailToS3, uploadVideoToS3 } from "../../utils/s3Upload";
import { resizeVideoThumbnail } from "../../utils/image/resizeVideoThumbnail";
import { videoProcessingQueue } from "../../queues/video.queue";

export const addVideoToChannel = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { channelId, title, description } = req.body;

    if (!channelId || !title) {
      throw new AppError("channelId and title are required", 400);
    }

    const files = req.files as {
      video?: Express.Multer.File[];
      thumbnail?: Express.Multer.File[];
    };

    if (!files?.video?.[0]) {
      throw new AppError("Video file is required", 400);
    }

    if (!files?.thumbnail?.[0]) {
      throw new AppError("Thumbnail image is required", 400);
    }
    let videoThumbnailKeys = {
    thumbnail: "",
    small: "",
    medium: "",
    large: "",
};
    // 1️⃣ Create DB record FIRST (no S3 yet)
    const video = await addVideoToChannelService(
      req.user!.id,
      channelId,
      title,
      "",        // videoUrl will be filled by worker
      description,
      videoThumbnailKeys         // thumbnail filled by worker
    );

    // 2️⃣ Push job to queue
    await videoProcessingQueue.add("process-video", {
      videoId: video._id.toString(),
      videoBuffer: files.video[0].buffer,
      videoMime: files.video[0].mimetype,
      thumbnailBuffer: files.thumbnail[0].buffer,
    });

    // 3️⃣ Respond immediately
    res.status(202).json({
      success: true,
      videoId: video._id,
      processingStatus: "PROCESSING",
    });
  }
);

export const getChannelVideos = asyncHandler(
  async (req: any, res: Response) => {
    const { channelId } = req.params;

    const videos = await getChannelVideosService(channelId);

    res.status(200).json({
      success: true,
      videos,
    });
  }
);
