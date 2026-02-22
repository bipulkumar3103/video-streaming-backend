import dotenv from "dotenv";
dotenv.config();
import "./workers/video.worker"; // Worker auto-starts when imported

import app from "./app";
import { connectDB } from "./config/db";

const PORT = Number(process.env.PORT) || 5000;

(async () => {
  await connectDB();

  app.listen(PORT,"0.0.0.0", () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
})();
