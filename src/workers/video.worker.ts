import { Worker } from "bullmq";
import { redisConnection } from "../config/redis";
import { Video } from "../modules/video/video.model";
import { uploadVideoToS3, uploadVideoThumbnailToS3 } from "../utils/s3Upload";
import { resizeVideoThumbnail } from "../utils/image/resizeVideoThumbnail";

export const videoWorker = new Worker(
  "video-processing",
  async (job) => {
    const {
      videoId,
      videoBuffer,
      videoMime,
      thumbnailBuffer,
    } = job.data;

    try {
      // 1️⃣ Upload video to S3
      const videoKey = await uploadVideoToS3(videoBuffer, videoMime);

      // 2️⃣ Resize thumbnail
      const resized = await resizeVideoThumbnail(thumbnailBuffer);

      // 3️⃣ Upload thumbnails
      const thumbnailKeys = {
        thumbnail: await uploadVideoThumbnailToS3(resized.thumbnail, "thumbnail"),
        small: await uploadVideoThumbnailToS3(resized.small, "small"),
        medium: await uploadVideoThumbnailToS3(resized.medium, "medium"),
        large: await uploadVideoThumbnailToS3(resized.large, "large"),
      };

      // 4️⃣ Update DB (SUCCESS)
      await Video.findByIdAndUpdate(videoId, {
        videoUrl: videoKey,
        thumbnail: thumbnailKeys,
        processingStatus: "READY",
        status: "PUBLISHED",
      });

    } catch (err) {
      // 5️⃣ Update DB (FAILURE)
      await Video.findByIdAndUpdate(videoId, {
        processingStatus: "FAILED",
      });
      throw err;
    }
  },
  {
    connection: redisConnection,
    concurrency: 2,
  }
);
