import { Schema, model, Document, Types } from "mongoose";

export type EventStatus = "UPCOMING" | "LIVE" | "ENDED";

export interface IEvent extends Document {
  video: Types.ObjectId;
  channel: Types.ObjectId;
  owner: Types.ObjectId;

  startTime: Date;
  loop: boolean;

  status: EventStatus;
  isActive: boolean;

  createdAt: Date;
  updatedAt: Date;
}

const EventSchema = new Schema<IEvent>(
  {
    video: {
      type: Schema.Types.ObjectId,
      ref: "Video",
      required: true,
      index: true,
    },

    channel: {
      type: Schema.Types.ObjectId,
      ref: "Channel",
      required: true,
      index: true,
    },

    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    startTime: {
      type: Date,
      required: true,
      index: true,
    },

    loop: {
      type: Boolean,
      default: true,
    },

    status: {
      type: String,
      enum: ["UPCOMING", "LIVE", "ENDED"],
      default: "UPCOMING",
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  { timestamps: true }
);

EventSchema.index({ isActive: 1, startTime: -1 });
EventSchema.index({ startTime: -1 });

export const Event = model<IEvent>("Event", EventSchema);
