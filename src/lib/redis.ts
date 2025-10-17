import Redis from "ioredis";

const redisUrl = process.env.REDIS_URL;

if (!redisUrl) {
  console.error("❌ REDIS_URL não encontrada no ambiente! Usando fallback para localhost.");
}

const redis = new Redis(redisUrl || "redis://localhost:6379", {
  maxRetriesPerRequest: 3,
  retryStrategy(times) {
    return Math.min(times * 50, 2000);
  },
});

redis.on("connect", () => console.log("✅ Conectado ao Redis"));
redis.on("error", (err) => console.error("❌ Erro Redis:", err));

export default redis;
