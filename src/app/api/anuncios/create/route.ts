// src/app/api/anuncios/create/route.ts
import { NextResponse } from "next/server";
import { connectDB, DISABLE_MONGO } from "@/lib/mongodb";
import { Anuncio } from "@/models/Anuncio";
import redis from "@/lib/redis";

async function clearCachePrefix(prefix: string) {
  if (DISABLE_MONGO) return; // Não faz nada se o mongo estiver desabilitado
  try {
    const keys = await redis.keys(`${prefix}:*`);
    if (keys.length > 0) {
      await redis.del(keys);
      console.log(`🧹 Cache cleared: ${keys.length} keys removed starting with '${prefix}:'`);
    }
  } catch (error) {
    console.error("Error clearing cache:", error);
  }
}

export async function POST(req: Request) {
  try {
    const db = await connectDB();
    if (!db) {
       return NextResponse.json({ ok: true, anuncio: { _id: "mock_id", ...await req.json() } }, { status: 201 });
    }

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

    // Limpa o cache após criar um novo anúncio para garantir que as listas sejam atualizadas
    await clearCachePrefix("anuncios");

    return NextResponse.json({ ok: true, anuncio });
  } catch (err: any) {
    console.error("Erro /api/anuncios/create:", err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}