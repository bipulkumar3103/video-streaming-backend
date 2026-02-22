import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import crypto from "crypto";
import { s3 } from "./s3Client";
import dotenv from "dotenv";
dotenv.config();


export const uploadVideoToS3 = async (
  buffer: Buffer,
  mimetype: string
): Promise<string> => {
  const key = `videos/${Date.now()}-${Number(crypto.randomUUID())}.mp4`;

  await s3.send(
    new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET!,
      Key: key,
      Body: buffer,
      ContentType: mimetype,
    })
  );

  return key; // IMPORTANT: return KEY, not URL
};
export const uploadBufferToS3 = async (
  buffer: Buffer,
  folder: string
): Promise<string> => {
  const key = `${folder}/${Date.now()}-${crypto.randomUUID()}.png`;
  console.log("Using S3 region:", process.env.AWS_REGION);
  console.log("S3 client config:", s3.config.region);
  await s3.send(
    new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET!,
      Key: key,
      Body: buffer,
      ContentType: "image/png",
    })
  );

  return key;
};
export const uploadVideoThumbnailToS3 = async (
  buffer: Buffer,
  size: string
): Promise<string> => {
  const key = `video-thumbnails/${size}/${Date.now()}-${crypto.randomUUID()}.png`;

  await s3.send(
    new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET!,
      Key: key,
      Body: buffer,
      ContentType: "image/png",
    })
  );

  return key;
};
