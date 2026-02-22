

import { IVideo, Video } from "./video.model";
import { Channel } from "../channel/channel.model";
import { AppError } from "../../common/errors/AppError";
import { VideoThumbnailKeys } from "./video.model";
import { getSignedImageUrl, getSignedVideoUrl } from "../../utils/s3SignedUrl";

export const addVideoToChannelService = async (
  ownerId: string,
  channelId: string,
  title: string,
  videoKey: string,
  description?: string,
  thumbnails?: VideoThumbnailKeys
) => {
  const channel = await Channel.findOne({
    _id: channelId,
    owner: ownerId,
    isActive: true,
  });

  if (!channel) {
    throw new AppError("Channel not found or access denied", 403);
  }

  return Video.create({
    title: title.trim(),
    description,
    channel: channel._id,
    videoUrl: videoKey,
    thumbnail: thumbnails,
    status: "DRAFT",
  });
};



export const getChannelVideosService = async (channelId: string) => {
  const videos = await Video.find<IVideo>({
    channel: channelId,
    status: "PUBLISHED",
    processingStatus: "READY", // 👈 Add filter
  }).sort({ createdAt: -1 });

  // 👇 Map to include signed URLs
  return Promise.all(
    videos.map(async (video) => {
      const videoUrl = video.videoUrl
        ? await getSignedVideoUrl(video.videoUrl)
        : null;

      const thumbnail = video.thumbnail
        ? {
            thumbnail: await getSignedImageUrl(video.thumbnail.thumbnail),
            small: await getSignedImageUrl(video.thumbnail.small),
            medium: await getSignedImageUrl(video.thumbnail.medium),
            large: await getSignedImageUrl(video.thumbnail.large),
          }
        : null;

      return {
        id: video._id.toString(),
        title: video.title,
        description: video.description,
        videoUrl,
        thumbnail,
        duration: video.duration,
        createdAt: video.createdAt,
      };
    })
  );
};