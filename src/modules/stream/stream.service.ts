import fs from "fs";
import path from "path";
import { Event } from "../event/event.model";
import { computeFakeLiveState } from "../fakeLive/fakeLive.engine";
import { AppError } from "../../common/errors/AppError";
import { IVideo } from "../video/video.model";

const VIDEO_BASE_PATH = path.join(process.cwd(), "videos");

export const streamEventVideo = async (
    eventId: string,
    range: string | undefined,
    res: any
) => {
    const event: any = await Event.findById(eventId).populate<{ video: IVideo }>("video");
    if (!event || !event.video) {
        throw new AppError("Event not found", 404);
    }

    const fakeLive = computeFakeLiveState(
        event.startTime,
        60 * 60 // duration seconds
    );

    if (fakeLive.status !== "LIVE") {
        throw new AppError("Event is not live", 403);
    }

    const videoPath = path.join(
        VIDEO_BASE_PATH,
        event.video.videoUrl
    );

    if (!fs.existsSync(videoPath)) {
        throw new AppError("Video file missing", 404);
    }

    const videoSize = fs.statSync(videoPath).size;

    if (!range) {
        throw new AppError("Range header required", 416);
    }

    const CHUNK_SIZE = 10 ** 6; // 1MB
    const start = Number(range.replace(/\D/g, ""));
    const maxAllowed =
        fakeLive.playbackSeconds * 250000; // approx bytes/sec

    if (start > maxAllowed) {
        throw new AppError("Seek ahead not allowed", 403);
    }

    const end = Math.min(start + CHUNK_SIZE, videoSize - 1);

    const headers = {
        "Content-Range": `bytes ${start}-${end}/${videoSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": end - start + 1,
        "Content-Type": "video/mp4",
    };

    res.writeHead(206, headers);

    const stream = fs.createReadStream(videoPath, { start, end });
    stream.pipe(res);
};
