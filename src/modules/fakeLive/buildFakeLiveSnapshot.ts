import { computeFakeLiveState } from "./fakeLive.engine";
import { computeFakeLiveViewers } from "./fakeViewers.engine";
import { computeFakeLikes } from "./fakeLikes.engine";
import { computeFakeComments } from "./fakeComments.engine";

export const buildFakeLiveSnapshot = ({
  eventStartTime,
  durationSeconds,
  maxDurationSeconds, // 👈 Optional
}: {
  eventStartTime: Date;
  durationSeconds: number;
  maxDurationSeconds?: number;
}) => {
  const state = computeFakeLiveState(
    eventStartTime,
    durationSeconds,
    undefined, // now defaults to new Date()
    maxDurationSeconds,
  );

  return {
    state,
    stats: {
      viewers: computeFakeLiveViewers({
        eventStartTime,
        durationSeconds,
      }),
      likes: computeFakeLikes({
        eventStartTime,
        durationSeconds,
      }),
    },
    comments: computeFakeComments({
      eventStartTime,
      durationSeconds,
    }),
  };
};
