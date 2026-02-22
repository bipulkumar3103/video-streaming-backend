import { Channel, IChannelImage } from "./channel.model";
import { AppError } from "../../common/errors/AppError";

export const createChannelService = async (
  ownerId: string,
  name: string,
  description?: string,
  image?: IChannelImage  // placeholder, image handling later
) => {
  const existing = await Channel.findOne({
    owner: ownerId,
    name: name.trim(),
    isActive: true,
  });

  if (existing) {
    throw new AppError("Channel with this name already exists", 409);
  }

  const channel = await Channel.create({
    name: name.trim(),
    description,
    owner: ownerId,
    image, 
  });

  return channel;
};

export const getMyChannelsService = async (ownerId: string) => {
  return Channel.find({ owner: ownerId, isActive: true }).sort({
    createdAt: -1,
  });
};
