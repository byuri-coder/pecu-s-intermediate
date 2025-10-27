// src/app/api/calendario/delete/[id]/route.ts
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Evento } from "@/models/Evento";

export async function DELETE(req: Request, { params }: { params: { id: string }}) {
  try {
    await connectDB();
    const { id } = params;
    
    if (!id) {
        return NextResponse.json({ error: "ID do evento é obrigatório." }, { status: 400 });
    }
    
    await Evento.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Erro ao excluir evento:", err);
    return NextResponse.json({ error: "Erro ao excluir evento" }, { status: 500 });
  }
}
