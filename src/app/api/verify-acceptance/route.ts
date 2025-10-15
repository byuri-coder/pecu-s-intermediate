
import { connectMongo } from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  await connectMongo();
  // A lógica original de verificação de aceite foi removida.
  console.log("Endpoint verify-acceptance agora tenta conectar ao MongoDB.");
  // A rota agora retornaria um JSON em vez de redirecionar.
  return NextResponse.json({ status: "ok", message: "Conexão com DB estabelecida (simulado)." });
}
