export type FakeLiveStatus = "UPCOMING" | "LIVE" | "ENDED";

export interface FakeLiveResult {
  status: FakeLiveStatus;
  playbackSeconds: number;
  canPlay: boolean;
  secondsToStart?: number;
  secondsRemaining?: number;
}

export const computeFakeLiveState = (
  eventStartTime: Date,
  videoDurationSeconds: number,
  now: Date = new Date(),
  maxDurationSeconds?: number // 👈 Optional: max event duration
): FakeLiveResult => {
  const start = eventStartTime.getTime();
  const current = now.getTime();
  const elapsedSeconds = Math.floor((current - start) / 1000);

  if (elapsedSeconds < 0) {
    return {
      status: "UPCOMING",
      playbackSeconds: 0,
      canPlay: false,
      secondsToStart: Math.abs(elapsedSeconds),
    };
  }
  // 👇 Add ENDED logic
  // If maxDuration is set and exceeded, event is ended
  if (maxDurationSeconds && elapsedSeconds >= maxDurationSeconds) {
    return {
      status: "ENDED",
      playbackSeconds: videoDurationSeconds,
      canPlay: false,
      secondsRemaining: 0,
    };
  }
  // Loop support: calculate position within current loop
const playbackSeconds =
  elapsedSeconds % videoDurationSeconds;

  return {
    status: "LIVE",
    playbackSeconds: playbackSeconds,
    canPlay: true,
    secondsRemaining: videoDurationSeconds - playbackSeconds,
  };
};
