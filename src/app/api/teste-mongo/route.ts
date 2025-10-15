import { NextResponse } from "next/server";
import mongoose from "mongoose";

export async function GET() {
  try {
    // Conecta ao Atlas
    await mongoose.connect(process.env.MONGO_URL as string);

    // Retorna sucesso
    return NextResponse.json({ status: "✅ Conectado ao MongoDB Atlas com sucesso!" });
  } catch (error: any) {
    // Retorna erro detalhado
    return NextResponse.json({
      status: "❌ Falha na conexão",
      error: error.message,
    }, { status: 500 });
  }
}
