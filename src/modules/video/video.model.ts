import { Schema, model, Document, Types } from "mongoose";
export interface VideoThumbnailKeys {
    thumbnail: string;
    small: string;
    medium: string;
    large: string;
}
export type VideoStatus = "DRAFT" | "PUBLISHED" | "BLOCKED";
export type VideoProcessingStatus = "PROCESSING" | "READY" | "FAILED";
export interface IVideo extends Document {
    title: string;
    description?: string;

    channel: Types.ObjectId;

    videoUrl?: string;
    thumbnail?: VideoThumbnailKeys;
    duration?: number;

    status: VideoStatus;

    processingStatus: VideoProcessingStatus;

    createdAt: Date;
    updatedAt: Date;
}

const VideoSchema = new Schema<IVideo>(
    {
        title: { type: String, required: true, trim: true },

        description: String,

        channel: {
            type: Schema.Types.ObjectId,
            ref: "Channel",
            required: true,
            index: true,
        },

        videoUrl: { type: String },

        thumbnail: {
            type: Object as () => VideoThumbnailKeys,
        },

        duration: Number,

        status: {
            type: String,
            enum: ["DRAFT", "PUBLISHED", "BLOCKED"],
            default: "DRAFT",
            index: true,
        },
        processingStatus: {
            type: String,
            enum: ["PROCESSING", "READY", "FAILED"],
            default: "PROCESSING",
            index: true,
        }
    },
    {
        timestamps: true,
    }
);

VideoSchema.index({ channel: 1, status: 1 });
VideoSchema.index({
  status: 1,
  processingStatus: 1,
});
export const Video = model<IVideo>("Video", VideoSchema);
