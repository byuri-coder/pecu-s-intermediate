import mongoose from "mongoose";

const MONGO_URL = process.env.MONGO_URL as string;

if (!MONGO_URL) {
  throw new Error("⚠️ Defina a variável de ambiente MONGO_URL no arquivo .env.local");
}

let isConnected = false;

export async function connectToDatabase() {
  if (isConnected) return;

  try {
    const db = await mongoose.connect(MONGO_URL);
    isConnected = !!db.connections[0].readyState;
    console.log("✅ Conectado ao MongoDB Atlas com sucesso!");
  } catch (error) {
    console.error("❌ Erro ao conectar ao MongoDB:", error);
    throw error;
  }
}
