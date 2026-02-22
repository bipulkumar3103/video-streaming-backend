import { redisConnection } from "../../config/redis";

const FEED_CACHE_TTL = 10; // seconds (short on purpose)

export const getFeedCache = async (key: string) => {
  const data = await redisConnection.get(key);
  return data ? JSON.parse(data) : null;
};

export const setFeedCache = async (
  key: string,
  value: any
) => {
  await redisConnection.setex(
    key,
    FEED_CACHE_TTL,
    JSON.stringify(value)
  );
};
