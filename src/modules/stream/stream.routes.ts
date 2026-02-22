import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { streamEvent } from "./stream.controller";

const router = Router();

router.get("/:eventId", authenticate, streamEvent);

export default router;
