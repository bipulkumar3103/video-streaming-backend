interface FakeLikesInput {
  eventStartTime: Date;
  durationSeconds: number;
  now?: Date;
  baseLikes?: number; // likes gained per loop
}

export const computeFakeLikes = ({
  eventStartTime,
  durationSeconds,
  now = new Date(),
  baseLikes = 900,
}: FakeLikesInput): number => {
  const elapsed =
    (now.getTime() - eventStartTime.getTime()) / 1000;

  if (elapsed < 0) return 0;

  // Number of completed loops
  const loopsCompleted = Math.floor(elapsed / durationSeconds);

  // Time inside current loop
  const t = elapsed % durationSeconds;
  const progress = t / durationSeconds;

  /**
   * Smooth S-curve using cosine easing
   * 0 → 1 smoothly
   */
  const easedProgress =
    0.5 - Math.cos(Math.PI * progress) / 2;

  // Likes gained in current loop
  const currentLoopLikes = Math.floor(
    baseLikes * easedProgress
  );

  // Total likes = completed loops + current loop
  const totalLikes =
    loopsCompleted * baseLikes + currentLoopLikes;

  return Math.max(0, totalLikes);
};
