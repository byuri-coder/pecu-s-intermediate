// src/app/api/anuncios/list/route.ts
import { NextResponse } from "next/server";
import { connectMongo } from "@/lib/mongodb";
import { Anuncio } from "@/models/Anuncio";

export async function GET(req: Request) {
  try {
    await connectMongo();
    const url = new URL(req.url);
    const page = Math.max(Number(url.searchParams.get("page") || "1"), 1);
    const limit = Math.min(Number(url.searchParams.get("limit") || "12"), 100);
    const tipo = url.searchParams.get("tipo"); // optional
    const status = url.searchParams.get("status") || "Disponível";

    const filter: any = { status };
    if (tipo) filter.tipo = tipo;

    const skip = (page - 1) * limit;
    const total = await Anuncio.countDocuments(filter);
    const anuncios = await Anuncio.find(filter).sort({ criadoEm: -1 }).skip(skip).limit(limit).lean();

    return NextResponse.json({ ok: true, page, limit, total, anuncios });
  } catch (err: any) {
    console.error("Erro /api/anuncios/list:", err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
