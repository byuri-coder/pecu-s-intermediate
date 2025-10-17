// src/app/api/anuncios/list/route.ts
import { NextResponse } from "next/server";
import { connectMongo } from "@/lib/mongodb";
import { Anuncio } from "@/models/Anuncio";
import redis from "@/lib/redis";


export async function GET(req: Request) {
  const url = new URL(req.url);
  const cacheKey = `anuncios:${url.search || "all"}`; 

  try {
    const cached = await redis.get(cacheKey);
    if (cached) {
      console.log("✅ Cache hit:", cacheKey);
      return NextResponse.json(JSON.parse(cached));
    }
     console.log("❌ Cache miss:", cacheKey);

    await connectMongo();
    
    const page = Math.max(Number(url.searchParams.get("page") || "1"), 1);
    const limit = Math.min(Number(url.searchParams.get("limit") || "12"), 100);
    const tipo = url.searchParams.get("tipo"); 
    const status = url.searchParams.get("status") || "Disponível";

    const filter: any = { status };
    if (tipo) filter.tipo = tipo;

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
