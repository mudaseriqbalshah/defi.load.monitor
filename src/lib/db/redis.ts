import Redis from "ioredis";

const globalForRedis = globalThis as unknown as {
  redis: Redis | null;
  redisReady: boolean;
};

function createRedisClient(): Redis | null {
  try {
    const client = new Redis(process.env.REDIS_URL ?? "redis://localhost:6379", {
      maxRetriesPerRequest: 1,
      lazyConnect: true,
      retryStrategy(times) {
        if (times > 3) return null; // Stop retrying
        return Math.min(times * 200, 2000);
      },
    });

    client.on("error", () => {
      // Silently handle connection errors — cached() falls back gracefully
      globalForRedis.redisReady = false;
    });

    client.on("ready", () => {
      globalForRedis.redisReady = true;
    });

    return client;
  } catch {
    return null;
  }
}

if (!globalForRedis.redis && globalForRedis.redis !== null) {
  globalForRedis.redis = createRedisClient();
}

export const redis = globalForRedis.redis;

if (process.env.NODE_ENV !== "production" && !globalForRedis.redis) {
  globalForRedis.redis = createRedisClient();
}

// Cache helper with TTL (seconds).
// Falls back to direct fetch when Redis is unavailable.
export async function cached<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = 300
): Promise<T> {
  if (redis && globalForRedis.redisReady) {
    try {
      const hit = await redis.get(key);
      if (hit) return JSON.parse(hit) as T;

      const data = await fetcher();
      await redis.set(key, JSON.stringify(data), "EX", ttl);
      return data;
    } catch {
      // Redis error — fall through to direct fetch
    }
  }

  return fetcher();
}
