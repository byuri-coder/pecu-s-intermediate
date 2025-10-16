// src/app/api/usuarios/salvar/route.ts
import { NextResponse } from "next/server";
import { connectMongo } from "@/lib/mongodb";
import { Usuario } from "@/models/Usuario";

export async function POST(req: Request) {
  try {
    await connectMongo();
    const data = await req.json();

    if (!data.uidFirebase || !data.email) {
      return NextResponse.json({ ok: false, error: "uidFirebase e email são obrigatórios" }, { status: 400 });
    }

    const usuario = await Usuario.findOneAndUpdate(
      { uidFirebase: data.uidFirebase },
      {
        nome: data.nome || undefined,
        email: data.email,
        tipo: data.tipo || "comprador",
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    return NextResponse.json({ ok: true, usuario });
  } catch (err: any) {
    console.error("Erro /api/usuarios/salvar:", err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
