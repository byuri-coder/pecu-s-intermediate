// src/app/api/anuncios/get/[id]/route.ts
import { NextResponse } from "next/server";
import { connectDB, DISABLE_MONGO } from "@/lib/mongodb";
import { Anuncio } from "@/models/Anuncio";
import mongoose from "mongoose";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const db = await connectDB();
    if (DISABLE_MONGO || !db) {
       console.log("📄 Usando dados mockados (sem MongoDB)");
       // Since placeholder data is removed, return a clear error or empty state for mock mode.
       return NextResponse.json({ ok: false, error: "Mock mode: Anúncio não encontrado" }, { status: 404 });
    }

    const { id } = params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return NextResponse.json({ ok: false, error: "ID de anúncio inválido" }, { status: 400 });
    }

    const anuncio = await Anuncio.findById(id).lean();

    if (!anuncio) {
      return NextResponse.json({ ok: false, error: "Anúncio não encontrado" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, anuncio });
  } catch (err: any) {
    console.error(`Erro /api/anuncios/get/${params.id}:`, err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
