// src/app/api/anuncios/list/route.ts
import { NextResponse } from "next/server";
import { connectMongo } from "@/lib/mongodb";
import { Anuncio } from "@/models/Anuncio";
import redis from "@/lib/redis";
import crypto from "crypto";

// Função auxiliar para gerar uma chave de cache única por filtro/página/usuário
function generateCacheKey(base: string, queryParams: any) {
  const queryString = JSON.stringify(queryParams);
  const hash = crypto.createHash("md5").update(queryString).digest("hex");
  return `${base}:${hash}`;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const queryParams = Object.fromEntries(url.searchParams.entries());
  const cacheKey = generateCacheKey("anuncios", queryParams);

  try {
    const cached = await redis.get(cacheKey);
    if (cached) {
      console.log("✅ Cache hit:", cacheKey);
      return NextResponse.json(JSON.parse(cached));
    }
    console.log("❌ Cache miss:", cacheKey);

    await connectMongo();
    
    const page = Math.max(Number(url.searchParams.get("page") || "1"), 1);
    const limit = Math.min(Number(url.searchParams.get("limit") || "100"), 100);
    const tipo = url.searchParams.get("tipo"); 
    const uidFirebase = url.searchParams.get("uidFirebase");

    const filter: any = {};
    
    if (tipo) filter.tipo = tipo;

    if (uidFirebase) {
        filter.uidFirebase = uidFirebase;
    } else {
        // Para marketplaces públicos, apenas os disponíveis/ativos
        filter.status = { $in: ["Disponível", "Ativo"] };
    }

    const skip = (page - 1) * limit;
    const total = await Anuncio.countDocuments(filter);
    const anuncios = await Anuncio.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean();

    const responseBody = { ok: true, page, limit, total, anuncios };

    // Salva no cache por 5 minutos
    await redis.set(cacheKey, JSON.stringify(responseBody), "EX", 60 * 5); 

    return NextResponse.json(responseBody);
  } catch (err: any) {
    console.error("Erro /api/anuncios/list:", err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
