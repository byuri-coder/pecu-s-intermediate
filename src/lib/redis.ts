import Redis from "ioredis";

let redis: Redis;

// This function attempts to create a Redis client.
function createRedisClient(url: string, isExplicit: boolean): Redis {
  const client = new Redis(url, {
    maxRetriesPerRequest: isExplicit ? 3 : 1, // Be less aggressive with local fallback
    retryStrategy(times) {
      if (!isExplicit) return null; // Don't retry for local fallback
      return Math.min(times * 50, 2000);
    },
    showFriendlyErrorStack: true,
    lazyConnect: true, // Don't connect until the first command
  });

  client.on("connect", () => {
    if (isExplicit) {
      console.log("✅ Conectado ao Redis");
    } else {
      console.log("✅ Conectado ao Redis (fallback local).");
    }
  });

  client.on("error", (err) => {
    if (isExplicit) {
      console.error("❌ Erro de conexão com o Redis:", err.message);
    } else {
      // For local fallback, errors are more expected, so we just log a warning.
      // console.warn(`⚠️ Could not connect to local Redis fallback: ${err.message}`);
    }
  });

  return client;
}

if (process.env.REDIS_URL) {
  redis = createRedisClient(process.env.REDIS_URL, true);
} else {
  console.warn(
    "⚠️ REDIS_URL not found. Falling back to localhost:6379. This is expected for local development."
  );
  redis = createRedisClient("redis://localhost:6379", false);
}


export default redis;
