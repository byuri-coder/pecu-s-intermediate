import mongoose from "mongoose";

const MONGO_URL = process.env.MONGO_URL as string;
if (!MONGO_URL) throw new Error("❌ MONGO_URL não configurada");

let isConnected = false;

export async function connectMongo() {
  if (isConnected) return;
  try {
    await mongoose.connect(MONGO_URL);
    isConnected = true;
    console.log("✅ MongoDB conectado com sucesso!");
  } catch (error) {
    console.error("❌ Erro ao conectar ao MongoDB:", error);
  }
}
