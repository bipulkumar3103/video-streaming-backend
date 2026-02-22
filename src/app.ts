import express from "express";
import cors from "cors";
import helmet from "helmet";
import authRoutes from "./modules/auth/auth.routes";
import userRoutes from "./modules/user/user.routes";
import channelRoutes from "./modules/channel/channel.routes";
import videoRoutes from "./modules/video/video.routes";
import eventRoutes from "./modules/event/event.routes";
import feedRoutes from "./modules/feed/feed.routes";
import { globalErrorHandler } from "./middlewares/error.middleware";
import dotenv from "dotenv";
dotenv.config();
const app = express();

app.use(helmet());
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://nonfacetious-jestine-unsneeringly.ngrok-free.dev",
    ],
    credentials: true,
  })
);
app.use(express.json());

app.get("/health", (_, res) => {
  res.status(200).json({ status: "OK" });
});

app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/channels", channelRoutes);
app.use("/videos", videoRoutes);
app.use("/events", eventRoutes);
app.use("/feed", feedRoutes); // 👈 Add this







// 👇 MUST be last
// Error handling middleware
app.use(globalErrorHandler);

export default app;
