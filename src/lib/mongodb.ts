import mongoose, { Connection } from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  throw new Error("⚠️ A variável de ambiente MONGODB_URI não está definida!");
}

interface MongooseCache {
  conn: Connection | null;
  promise: Promise<typeof mongoose> | null;
}

let cached: MongooseCache = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

export async function connectToDatabase(): Promise<Connection> {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      dbName: "plataforma", // opcional: nome do seu banco no Atlas
      bufferCommands: false,
    });
  }

  const mongooseInstance = await cached.promise;
  cached.conn = mongooseInstance.connection;

  return cached.conn;
}
