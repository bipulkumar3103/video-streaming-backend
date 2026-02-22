import { Event } from "./event.model";
import { Video } from "../video/video.model";
import { Channel } from "../channel/channel.model";
import { AppError } from "../../common/errors/AppError";

export const startEventNowService = async (
  ownerId: string,
  videoId: string
) => {
  const video = await Video.findById(videoId);
  if (!video) throw new AppError("Video not found", 404);

  const channel = await Channel.findOne({
    _id: video.channel,
    owner: ownerId,
    isActive: true,
  });

  if (!channel) {
    throw new AppError("Access denied", 403);
  }

  const existingLive = await Event.findOne({
    video: videoId,
    status: "LIVE",
  });

  if (existingLive) {
    throw new AppError("Event already live for this video", 409);
  }

  const event = await Event.create({
    video: video._id,
    channel: channel._id,
    owner: ownerId,
    startTime: new Date(),
    status: "LIVE",
    loop: true,
    isActive: true,
  });

  return event;
};

export const scheduleEventService = async (
  ownerId: string,
  videoId: string,
  startTime: Date
) => {
  if (startTime <= new Date()) {
    throw new AppError("Start time must be in the future", 400);
  }

  const video = await Video.findById(videoId);
  if (!video) throw new AppError("Video not found", 404);

  const channel = await Channel.findOne({
    _id: video.channel,
    owner: ownerId,
    isActive: true,
  });

  if (!channel) {
    throw new AppError("Access denied", 403);
  }

  const event = await Event.create({
    video: video._id,
    channel: channel._id,
    owner: ownerId,
    startTime,
    status: "UPCOMING",
    loop: true,
    isActive: true,
  });

  return event;
};
