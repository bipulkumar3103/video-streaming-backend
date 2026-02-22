import { Response } from "express";
import { AuthRequest } from "../../middlewares/auth.middleware";
import { asyncHandler } from "../../common/utils/asyncHandler";
import { AppError } from "../../common/errors/AppError";
import {
  createChannelService,
  getMyChannelsService,
} from "./channel.service";
import { uploadBufferToS3 } from "../../utils/s3Upload";
import { mapChannelToResponse } from "./channel.mapper";
import { resizeChannelImages } from "../../utils/image/imageResize";

export const createChannel = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { name, description } = req.body;
    console.log("Received channel creation request with name:", name);
    if (!name) {
      throw new AppError("Channel name is required", 400);
    }
    console.log("Checking for uploaded file...");
    if (!req.file) {
      throw new AppError("Channel image is required", 400);
    }
    console.log("File received:", req.file.originalname, "Size:", req.file.size);
    // 1️⃣ Resize image
    const resizedImages = await resizeChannelImages(req.file.buffer);
    console.log("Image resized successfully");
    // 2️⃣ Upload resized images to S3
    const imageKeys = {
      original: await uploadBufferToS3(resizedImages.original, "channels/original"),
      thumbnail: await uploadBufferToS3(resizedImages.thumbnail, "channels/thumbnail"),
      small: await uploadBufferToS3(resizedImages.small, "channels/small"),
      medium: await uploadBufferToS3(resizedImages.medium, "channels/medium"),
      large: await uploadBufferToS3(resizedImages.large, "channels/large"),
    };
    console.log("Images uploaded to S3 with keys:", imageKeys);

    // 3️⃣ Create channel with image keys
    const channel = await createChannelService(
      req.user!.id,
      name,
      description,
      imageKeys
    );
    console.log("Channel created successfully with ID:", channel.id);
    res.status(201).json({
      success: true,
      channel,
    });
  }
);

export const getMyChannels = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const channels = await getMyChannelsService(req.user!.id);
    const response = channels.map(mapChannelToResponse);
    res.status(200).json({
      success: true,
      channels: response,
    });
  }
);
