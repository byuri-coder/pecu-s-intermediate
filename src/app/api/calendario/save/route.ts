// src/app/api/calendario/save/route.ts
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Evento } from "@/models/Evento";

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const { usuarioId, titulo, descricao, data, tipo, status, id } = body;

    if (!usuarioId || !titulo || !data) {
        return NextResponse.json({ error: "Dados obrigatórios ausentes." }, { status: 400 });
    }

    const eventoData = {
        usuarioId,
        titulo,
        descricao,
        data,
        tipo,
        status
    };

    const evento = id 
        ? await Evento.findByIdAndUpdate(id, eventoData, { new: true })
        : await Evento.create(eventoData);

    return NextResponse.json({ success: true, evento });
  } catch (err: any) {
    console.error("Erro ao salvar evento:", err);
    return NextResponse.json({ error: "Erro ao salvar evento" }, { status: 500 });
  }
}
