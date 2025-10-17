import Redis from "ioredis";

let redis: Redis;

// Prefer the single URL format if available (common in Render, Heroku)
if (process.env.REDIS_URL) {
  redis = new Redis(process.env.REDIS_URL, {
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
      return Math.min(times * 50, 2000);
    },
  });
} 
// Otherwise, try to use separate host, port, and password variables
else if (process.env.REDIS_HOST && process.env.REDIS_PORT) {
  redis = new Redis({
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT, 10),
    password: process.env.REDIS_PASSWORD, // ioredis handles if this is undefined
    maxRetriesPerRequest: null, // As per your suggestion for this setup
  });
} 
// Fallback for local development if no environment variables are set
else {
  console.warn("⚠️ No REDIS_URL or REDIS_HOST/PORT found. Falling back to localhost:6379. This is expected for local development.");
  redis = new Redis("redis://localhost:6379", {
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
      return Math.min(times * 50, 2000);
    },
  });
}

redis.on("connect", () => console.log("✅ Conectado ao Redis"));
redis.on("error", (err) => console.error("❌ Erro de conexão com o Redis:", err.message));

export default redis;
