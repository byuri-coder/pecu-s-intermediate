
import { connectDB } from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  await connectDB();
  // A lógica original de teste com o Brevo foi removida.
  console.log("Endpoint test-brevo agora tenta conectar ao MongoDB.");
  return NextResponse.json({ status: "ok", message: "Conexão com DB estabelecida (simulado)." });
}
