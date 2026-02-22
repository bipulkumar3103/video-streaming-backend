import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { startEventNow, scheduleEvent } from "./event.controller";
import { getEventDetail } from "./eventDetail.controller";

const router = Router();

router.post("/start", authenticate, startEventNow);
router.post("/schedule", authenticate, scheduleEvent);
router.get("/:eventId", getEventDetail); // 👈 Add this

export default router;
