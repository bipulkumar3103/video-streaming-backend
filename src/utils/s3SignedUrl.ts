import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { s3 } from "./s3Client";

import dotenv from "dotenv";
dotenv.config();
export const getSignedImageUrl = async (
  key: string,
  expiresIn = 600 // 10 minutes
) => {
  return getSignedUrl(
    s3,
    new GetObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET!,
      Key: key,
    }),
    { expiresIn }
  );
};

// 👇 Add video URL function
export const getSignedVideoUrl = async (
  key: string,
  expiresIn = 3600 // 1 hour for videos
) => {
  return getSignedUrl(
    s3,
    new GetObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET!,
      Key: key,
    }),
    { expiresIn }
  );
};