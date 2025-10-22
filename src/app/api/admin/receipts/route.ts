// src/app/api/admin/receipts/route.ts
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Comprovante } from "@/models/Comprovante";
import { Usuario } from "@/models/Usuario";

export async function GET(req: Request) {
  try {
    const db = await connectDB();
    if (!db) {
      return NextResponse.json({ ok: true, receipts: [] });
    }

    const receipts = await Comprovante.find({})
      .populate({ path: 'usuarioId', model: Usuario, select: 'nome uidFirebase' })
      .sort({ dataEnvio: -1 })
      .lean();

    const formattedReceipts = receipts.map(r => ({ ...r, usuario: r.usuarioId }));

    return NextResponse.json({ ok: true, receipts: formattedReceipts });

  } catch (err: any) {
    console.error("Erro /api/admin/receipts:", err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
