import multer from "multer";

export const uploadVideo = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 1024 * 1024 * 1024, // 1GB (adjust)
  },
  fileFilter(_, file, cb) {
    if (!file.mimetype.startsWith("video/")) {
      cb(new Error("Only video files allowed"));
    }
    cb(null, true);
  },
});

export const uploadImage = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter(_, file, cb) {
    if (!file.mimetype.startsWith("image/")) {
      cb(new Error("Only image files allowed"));
    }
    cb(null, true);
  },
});

