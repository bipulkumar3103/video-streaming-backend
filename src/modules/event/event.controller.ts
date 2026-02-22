import { Request, Response } from "express";
import { AuthRequest } from "../../middlewares/auth.middleware";
import { asyncHandler } from "../../common/utils/asyncHandler";
import { AppError } from "../../common/errors/AppError";
import {
  startEventNowService,
  scheduleEventService,
} from "./event.service";

export const startEventNow = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { videoId } = req.body;

    if (!videoId) {
      throw new AppError("videoId is required", 400);
    }

    const event = await startEventNowService(req.user!.id, videoId);

    res.status(201).json({
      success: true,
      event,
    });
  }
);

export const scheduleEvent = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { videoId, startTime } = req.body;

    if (!videoId || !startTime) {
      throw new AppError("videoId and startTime are required", 400);
    }

    const event = await scheduleEventService(
      req.user!.id,
      videoId,
      new Date(startTime)
    );

    res.status(201).json({
      success: true,
      event,
    });
  }
);
