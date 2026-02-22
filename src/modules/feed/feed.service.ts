import { getSignedImageUrl } from "../../utils/s3SignedUrl";
import { Event } from "../event/event.model";
import { buildFakeLiveSnapshot } from "../fakeLive/buildFakeLiveSnapshot";
import { getFeedCache, setFeedCache } from "./feed.cache";
const STATUS_PRIORITY = {
    UPCOMING: 1,
    LIVE: 2,
    ENDED: 3,
};

export const getFeedService = async ({
    limit = 10,
    cursor,
}: {
    limit?: number;
    cursor?: string;
}) => {
    const query: any = { isActive: true };

    // 🔥 Cursor filter
    if (cursor) {
        query.startTime = { $lt: new Date(cursor) };
    }

    // 🔥 Cache key
    const cacheKey = `feed:${limit}:${cursor || "null"}`;
    const cached = await getFeedCache(cacheKey);
    if (cached) {
        return cached;
    }

    // Fetch a bit more than needed (buffer)
    const events = await Event.find(query)
        .sort({ startTime: -1 })
        .limit(limit * 3)
        .lean() // 🔥 IMPORTANT
        .populate({
            path: "video",
            match: {
                status: "PUBLISHED",
                processingStatus: "READY",
            },
            select: "title thumbnail duration",
        })
        .populate({
            path: "channel",
            select: "name image",
        });

    const feedItems = await Promise.all(
        events
            .filter((e: any) => e.video && e.channel)
            .map(async (e: any) => {
                const durationSeconds = e.video.duration ?? 3600;
                const snapshot = buildFakeLiveSnapshot({
                    eventStartTime: e.startTime,
                    durationSeconds,
                });

                const thumbnailSmall = e.video.thumbnail?.small;
                const channelImageSmall = e.channel.image?.small;

                return {
                    id: e._id.toString(),
                    title: e.video.title,
                    startTime: e.startTime,
                    thumbnail: {
                        small: thumbnailSmall
                            ? await getSignedImageUrl(thumbnailSmall)
                            : "",
                    },
                    channel: {
                        id: e.channel._id.toString(),
                        name: e.channel.name,
                        image: {
                            small: channelImageSmall
                                ? await getSignedImageUrl(channelImageSmall)
                                : "",
                        },
                    },
                    fakeLive: {
                        status: snapshot.state.status,
                        viewers: snapshot.stats.viewers,
                    },
                };
            })
    );

    // 🔥 Sort: UPCOMING → LIVE → ENDED
    feedItems.sort((a, b) => {
        const statusDiff =
            STATUS_PRIORITY[a.fakeLive.status] -
            STATUS_PRIORITY[b.fakeLive.status];

        if (statusDiff !== 0) return statusDiff;

        // Secondary sort rules
        if (a.fakeLive.status === "UPCOMING") {
            return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
        }

        if (a.fakeLive.status === "LIVE") {
            return b.fakeLive.viewers - a.fakeLive.viewers;
        }

        return new Date(b.startTime).getTime() - new Date(a.startTime).getTime();
    });

    const sliced = feedItems.slice(0, limit);

    const result = {
        items: sliced,
        nextCursor:
            sliced.length > 0
                ? sliced[sliced.length - 1].startTime.toISOString()
                : null,
    };

    await setFeedCache(cacheKey, result);
    return result;
};
