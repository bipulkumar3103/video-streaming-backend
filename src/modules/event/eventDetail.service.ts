import { Event } from "./event.model";
import { computeFakeLiveState } from "../fakeLive/fakeLive.engine";
import { AppError } from "../../common/errors/AppError";
import { IVideo } from "../video/video.model";
import { IChannel } from "../channel/channel.model";
import { computeFakeLikes } from "../fakeLive/fakeLikes.engine";
import { computeFakeLiveViewers } from "../fakeLive/fakeViewers.engine";
import { computeFakeComments } from "../fakeLive/fakeComments.engine";
import { buildFakeLiveSnapshot } from "../fakeLive/buildFakeLiveSnapshot";
import { getSignedImageUrl } from "../../utils/s3SignedUrl";

const DEFAULT_LOOP_DURATION_SECONDS = 60 * 60; // 1 hour

export const getEventDetailService = async (eventId: string) => {
    const event = await Event.findById(eventId)
        .populate<{ video: IVideo }>("video")
        .populate<{ channel: IChannel }>("channel");

    if (!event || !event.video || !event.channel) {
        throw new AppError("Event not found", 404);
    }

    const video = event.video;
    const channel = event.channel;

    const durationSeconds =
        typeof video.duration === "number"
            ? video.duration
            : DEFAULT_LOOP_DURATION_SECONDS;

    const snapshot = buildFakeLiveSnapshot({
        eventStartTime: event.startTime,
        durationSeconds,
    });
    const thumbnailKey = video.thumbnail?.thumbnail;
    const thumbnailUrl = thumbnailKey
        ? await getSignedImageUrl(thumbnailKey)
        : "";
    return {
        id: event._id.toString(),
        title: video.title,
        thumbnail: thumbnailUrl,
        channel: {
            id: channel._id.toString(),
            name: channel.name,
        },
        status: snapshot.state.status,
        startTime: event.startTime,
        playback: {
            canPlay: snapshot.state.canPlay,
            startAtSeconds: snapshot.state.playbackSeconds,
            secondsRemaining: snapshot.state.secondsRemaining,
        },
        stats: snapshot.stats,
        comments: snapshot.comments,
    };
};
