// src/lib/mongodb.ts
import mongoose from "mongoose";

const MONGO_URL = process.env.MONGO_URL;
export const DISABLE_MONGO = process.env.DISABLE_MONGO === "true";

if (DISABLE_MONGO) {
  console.warn("⚠️ MongoDB desativado neste ambiente (modo mock/teste)");
} else if (!MONGO_URL) {
  throw new Error("❌ MONGO_URL não definida. Defina a variável de ambiente MONGO_URL.");
}

let cached: { conn: any; promise: any; } = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

export async function connectDB() {
  if (DISABLE_MONGO) {
    return null;
  }
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGO_URL!, {
      bufferCommands: false,
    }).then((mongoose) => {
      console.log("✅ Conectado ao MongoDB");
      return mongoose;
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
