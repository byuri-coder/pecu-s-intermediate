import { NextResponse } from "next/server";
import { connectMongo } from "@/lib/mongodb";
import { Usuario } from "@/models/Usuario";

export async function POST(req: Request) {
  try {
    await connectMongo();
    const data = await req.json();

    const usuario = await Usuario.findOneAndUpdate(
      { uidFirebase: data.uidFirebase },
      {
        nome: data.nome,
        email: data.email,
        tipo: data.tipo,
      },
      { new: true, upsert: true }
    );

    return NextResponse.json({ ok: true, usuario });
  } catch (error: any) {
    console.error("Erro ao salvar usuário:", error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
