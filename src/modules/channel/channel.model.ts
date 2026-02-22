import { Schema, model, Document, Types } from "mongoose";

export interface IChannelImage {
  original: string;
  thumbnail: string;
  small: string;
  medium: string;
  large: string;
}

export interface IChannel extends Document {
  name: string;
  description?: string;

  owner: Types.ObjectId;

  image: IChannelImage;

  isActive: boolean;

  createdAt: Date;
  updatedAt: Date;
}

const ChannelSchema = new Schema<IChannel>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    image: {
      original: { type: String, required: true },
      thumbnail: { type: String, required: true },
      small: { type: String, required: true },
      medium: { type: String, required: true },
      large: { type: String, required: true },
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

ChannelSchema.index({ owner: 1, name: 1 });
ChannelSchema.index({ isActive: 1 });
export const Channel = model<IChannel>("Channel", ChannelSchema);
