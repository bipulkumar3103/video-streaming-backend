import { Request, Response } from "express";
import { asyncHandler } from "../../common/utils/asyncHandler";
import { getEventDetailService } from "./eventDetail.service";

export const getEventDetail = asyncHandler(async (req: Request, res: Response) => {
  const rawEventId = req.params.eventId;

  const eventId = Array.isArray(rawEventId) ? rawEventId[0] : rawEventId;

  if (typeof eventId !== "string" || !eventId) {
    return res.status(400).json({ success: false, message: "Invalid event ID" });
  }
  const event = await getEventDetailService(eventId);

  res.status(200).json({
    success: true,
    event,
  });
});
