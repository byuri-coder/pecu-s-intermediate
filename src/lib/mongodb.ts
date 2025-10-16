// src/lib/mongodb.ts
import mongoose from "mongoose";

const MONGO_URL = process.env.MONGO_URL || process.env.MONGO_URI;

if (!MONGO_URL) {
  throw new Error("MONGO_URL não definida. Defina a variável de ambiente MONGO_URL.");
}

/**
 * Evita múltiplas conexões em hot-reload (Next dev / serverless).
 * Usa cache global em node (dev) para não reabrir conexão.
 */
let cached: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null } = (global as any).__mongo__;

if (!cached) {
  cached = (global as any).__mongo__ = { conn: null, promise: null };
}

export async function connectMongo() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      // useNewUrlParser, useUnifiedTopology são defaults já.
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000,
    };

    cached.promise = mongoose.connect(MONGO_URL!, opts).then((mongooseInstance) => {
      return mongooseInstance;
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}
