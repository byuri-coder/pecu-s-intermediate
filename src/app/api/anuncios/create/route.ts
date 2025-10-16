// src/app/api/anuncios/create/route.ts
import { NextResponse } from "next/server";
import { connectMongo } from "@/lib/mongodb";
import { Anuncio } from "@/models/Anuncio";

export async function POST(req: Request) {
  try {
    await connectMongo();
    const body = await req.json();

    // body deve conter uidFirebase e campos do anúncio
    const { uidFirebase, titulo, descricao, tipo, price, imagens, metadados } = body;

    if (!uidFirebase || !titulo) {
      return NextResponse.json({ ok: false, error: "uidFirebase e titulo são obrigatórios" }, { status: 400 });
    }

    const anuncio = await Anuncio.create({
      uidFirebase,
      titulo,
      descricao,
      tipo,
      price,
      imagens,
      metadados,
    });

    return NextResponse.json({ ok: true, anuncio });
  } catch (err: any) {
    console.error("Erro /api/anuncios/create:", err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
