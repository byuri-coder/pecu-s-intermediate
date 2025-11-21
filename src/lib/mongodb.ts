// src/lib/mongodb.ts
import mongoose from "mongoose";

const MONGO_URL = process.env.MONGO_URL;
export const DISABLE_MONGO = process.env.DISABLE_MONGO === "true";

// In production, the MONGODB_URI must be set.
if (process.env.NODE_ENV === "production" && !MONGO_URL) {
  throw new Error(
    "❌ MONGO_URL is not defined. Please set the MONGO_URL environment variable in your production environment."
  );
}

// In development, either MONGODB_URI should be set or mock mode should be explicitly enabled.
if (process.env.NODE_ENV !== "production" && !MONGO_URL && !DISABLE_MONGO) {
  console.warn(
    "⚠️ MONGO_URL is not defined in development. The app will run in mock mode (DISABLE_MONGO=true)."
  );
}

let cached: { conn: any; promise: any; } = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

export async function connectDB() {
  if (DISABLE_MONGO || (!MONGO_URL && process.env.NODE_ENV !== "production")) {
    if (!DISABLE_MONGO) {
      console.log("📄 MongoDB connection is disabled for this request (mock mode).");
    }
    return null;
  }
  
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    if (!MONGO_URL) {
       // This check is redundant due to the top-level check, but serves as a safeguard.
       throw new Error("Attempted to connect to DB without MONGO_URL.");
    }
    cached.promise = mongoose.connect(MONGO_URL, {
      bufferCommands: false,
    }).then((mongoose) => {
      console.log("✅ Conectado ao MongoDB");
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null; // Reset promise on connection error
    throw e;
  }

  return cached.conn;
}
