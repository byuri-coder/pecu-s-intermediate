// src/app/api/anuncios/create/route.ts
import { NextResponse } from "next/server";
import { connectDB, DISABLE_MONGO } from "@/lib/mongodb";
import { Anuncio } from "@/models/Anuncio";
import redis from "@/lib/redis";

async function clearCachePrefix(prefix: string) {
  try {
    const keys = await redis.keys(`${prefix}:*`);
    if (keys.length > 0) {
      await redis.del(keys);
      console.log(`🧹 Cache cleared: ${keys.length} keys removed starting with '${prefix}:'`);
    }
  } catch (error) {
    console.error("Error clearing Redis cache:", error);
  }
}

export async function POST(req: Request) {
  try {
    const db = await connectDB();
    if (!db) {
       // In production, if DB is not connected, we should not simulate success.
       if (process.env.NODE_ENV === 'production') {
            return NextResponse.json({ ok: false, error: "Database not available" }, { status: 503 });
       }
       console.log("📄 Usando dados mockados (sem MongoDB) - Anúncio não foi salvo.");
       return NextResponse.json({ ok: true, anuncio: { _id: "mock_id_not_saved", ...await req.json() } }, { status: 201 });
    }

    const body = await req.json();
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

    // Limpa o cache após criar um novo anúncio para garantir que as listas sejam atualizadas
    await clearCachePrefix("anuncios");

    return NextResponse.json({ ok: true, anuncio });
  } catch (err: any) {
    console.error("Erro /api/anuncios/create:", err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
