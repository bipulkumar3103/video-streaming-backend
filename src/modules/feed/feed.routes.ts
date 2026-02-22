import { Router } from "express";
import { getFeed } from "./feed.controller";

const router = Router();

router.get("/", getFeed);

export default router;