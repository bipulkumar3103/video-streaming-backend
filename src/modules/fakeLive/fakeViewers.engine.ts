interface FakeViewersInput {
    eventStartTime: Date;
    durationSeconds: number;
    now?: Date;
    baseViewers?: number;
}

export const computeFakeLiveViewers = ({
    eventStartTime,
    durationSeconds,
    now = new Date(),
    baseViewers = 1200,
}: FakeViewersInput): number => {
    const MIN_VIEWERS = Math.floor(baseViewers * 0.15);
    const elapsed =
        (now.getTime() - eventStartTime.getTime()) / 1000;

    if (elapsed < 0) return 0;

    // Loop support
    const t = elapsed % durationSeconds;
    const progress = t / durationSeconds;

    let multiplier = 0;

    // Warm-up (0–20%)
    if (progress < 0.2) {
        multiplier = progress / 0.2;
    }
    // Peak (20–70%)
    else if (progress < 0.7) {
        multiplier = 1;
    }
    // Cool-down (70–100%)
    else {
        multiplier = (1 - progress) / 0.3;
    }

    // Gentle noise (deterministic-ish)
    const noise =
        Math.sin(t / 15) * 0.05 +
        Math.cos(t / 23) * 0.03;

    const viewers = baseViewers * multiplier * (1 + noise);

    return Math.max(MIN_VIEWERS, Math.floor(viewers));
};
