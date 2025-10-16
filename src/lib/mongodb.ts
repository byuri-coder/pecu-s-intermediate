// src/lib/mongodb.ts
import mongoose from "mongoose";

const MONGO_URL = process.env.MONGO_URL;

if (!MONGO_URL) {
  throw new Error("MONGO_URL não definida. Defina a variável de ambiente MONGO_URL.");
}

/**
 * Mantém a conexão única durante o hot reload do Next.js.
 */
let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

export async function connectMongo() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000,
    };

    cached.promise = mongoose.connect(MONGO_URL, opts).then((mongoose) => {
      console.log("✅ Conectado ao MongoDB Atlas!");
      return mongoose;
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
