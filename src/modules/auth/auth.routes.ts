import { Router } from "express";
import { signup, login, refresh, logout } from "./auth.controller";
import { asyncHandler } from "../../common/utils/asyncHandler";
import { authRateLimiter } from "../../middlewares/rateLimit.middleware";

const router = Router();

router.post("/login", authRateLimiter, asyncHandler(login));
router.post("/signup", authRateLimiter, asyncHandler(signup));
router.post("/refresh", authRateLimiter, asyncHandler(refresh));
router.post("/logout", asyncHandler(logout));

export default router;
