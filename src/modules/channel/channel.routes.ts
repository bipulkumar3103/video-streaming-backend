import { NextFunction, Request,Response,Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { createChannel, getMyChannels } from "./channel.controller";
import { uploadImage } from "../../config/multer";
const router = Router();

// router.post(
//   "/",
//   authenticate,
//   uploadImage.single("image"), // 👈 REQUIRED
//   createChannel
// );

router.post(
  "/",
  authenticate,
  (req:Request, res:Response, next:NextFunction) => {
    console.log("Before multer");
    next();
  },
  uploadImage.single("image"),
  (req:Request, res:Response, next:NextFunction ) => {
    console.log("After multer");
    next();
  },
  createChannel
);
router.get("/me", authenticate, getMyChannels);

export default router;
