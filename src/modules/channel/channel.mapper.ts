import { IChannel } from "./channel.model";
import dotenv from "dotenv";
dotenv.config();
const ASSET_BASE_URL = process.env.S3_URL!;
console.log("ASSET_BASE_URL set to:", ASSET_BASE_URL);

export const mapChannelToResponse = (channel: IChannel) => {
  const buildUrl = (key: string) =>
    `${ASSET_BASE_URL}/${key}`;

  return {
    id: channel._id.toString(),
    name: channel.name,
    description: channel.description,
    isActive: channel.isActive,
    image: {
      thumbnail: buildUrl(channel.image.thumbnail),
      small: buildUrl(channel.image.small),
      medium: buildUrl(channel.image.medium),
      large: buildUrl(channel.image.large),
    },
    createdAt: channel.createdAt,
  };
};
