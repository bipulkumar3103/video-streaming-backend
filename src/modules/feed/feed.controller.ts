import { Request, Response } from "express";
import { asyncHandler } from "../../common/utils/asyncHandler";
import { getFeedService } from "./feed.service";

export const getFeed = asyncHandler(
  async (req: Request, res: Response) => {
    const limit = Math.min(
      Number(req.query.limit) || 10,
      30 // hard cap for safety
    );    
    console.log("Fetching feed with limit:", limit, "and cursor:", req.query.cursor);

    const cursor = req.query.cursor as string | undefined;

    const result = await getFeedService({ limit, cursor });

    res.status(200).json({
      success: true,
      items: result.items,
      nextCursor: result.nextCursor,
    });
  }
);
