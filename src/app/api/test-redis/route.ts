import { NextResponse } from "next/server";
import redis from "@/lib/redis";

export async function GET() {
  try {
    await redis.set("teste", "ok", "EX", 30); // expira em 30s
    const valor = await redis.get("teste");
    return NextResponse.json({ ok: true, valor });
  } catch (err: any) {
    console.error("Erro ao conectar Redis:", err);
    return NextResponse.json({ ok: false, erro: err.message }, { status: 500 });
  }
}
