import { asyncHandler } from "../../common/utils/asyncHandler";
import { streamEventVideo } from "./stream.service";

export const streamEvent = asyncHandler(async (req: any, res: any) => {
  const { eventId } = req.params;
  const range = req.headers.range;

  await streamEventVideo(eventId, range, res);
});
