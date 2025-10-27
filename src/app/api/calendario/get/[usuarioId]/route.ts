// src/app/api/calendario/get/[usuarioId]/route.ts
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Evento } from "@/models/Evento";

export async function GET(req: Request, { params }: { params: { usuarioId: string }}) {
  try {
    await connectDB();
    const { usuarioId } = params;
    
    if (!usuarioId) {
        return NextResponse.json({ error: "ID do usuário é obrigatório." }, { status: 400 });
    }
    
    const eventos = await Evento.find({ usuarioId }).sort({ data: 1 });
    return NextResponse.json({ eventos });
  } catch (err: any) {
    console.error("Erro ao buscar eventos:", err);
    return NextResponse.json({ error: "Erro ao buscar eventos" }, { status: 500 });
  }
}
