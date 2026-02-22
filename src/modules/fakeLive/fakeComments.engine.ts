import { COMMENT_POOLS } from "./fakeComments.data";

interface FakeComment {
    id: string;
    username: string;
    message: string;
    timestampSeconds: number;
}

interface FakeCommentsInput {
    eventStartTime: Date;
    durationSeconds: number;
    now?: Date;
    commentsPerMinute?: number;
}

const USERNAMES = [
    "alex_92",
    "music_lover",
    "livefan",
    "rockstar",
    "user123",
    "vibes_only",
    "happy_soul",
    "nightowl",
];

export const computeFakeComments = ({
    eventStartTime,
    durationSeconds,
    now = new Date(),
    commentsPerMinute = 6,
}: FakeCommentsInput): FakeComment[] => {
    const elapsed =
        (now.getTime() - eventStartTime.getTime()) / 1000;

    if (elapsed < 0) return [];

    // Loop handling
    const t = elapsed % durationSeconds;
    const progress = t / durationSeconds;

    // Total comments so far
    const totalComments = Math.floor(
        (t / 60) * commentsPerMinute
    );

    const comments: FakeComment[] = [];

    for (let i = 0; i < totalComments; i++) {
        const commentTime = Math.floor(
            (i / commentsPerMinute) * 60
        );

        let pool: string[];
        if (progress < 0.25) pool = COMMENT_POOLS.early;
        else if (progress < 0.75) pool = COMMENT_POOLS.mid;
        else pool = COMMENT_POOLS.late;

        const message =
            pool[i % pool.length];

        const username =
            USERNAMES[i % USERNAMES.length];


        const loopsCompleted = Math.floor(
            elapsed / durationSeconds
        );


        comments.push({
            id: `c_${loopsCompleted}_${i}`,
            username,
            message,
            timestampSeconds: commentTime,
        });
    }

    return comments;
};
