
// src/app/api/admin/receipts/[id]/route.ts
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Comprovante } from "@/models/Comprovante";
import mongoose from "mongoose";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const db = await connectDB();
    if (!db) {
      return NextResponse.json({ ok: false, error: "Database not connected" }, { status: 500 });
    }

    const { id } = params;
    const { status, motivoRecusa } = await req.json();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ ok: false, error: "ID inválido" }, { status: 400 });
    }

    if (!['Aprovado', 'Negado'].includes(status)) {
        return NextResponse.json({ ok: false, error: "Status inválido" }, { status: 400 });
    }

    const updatedReceipt = await Comprovante.findByIdAndUpdate(
      id,
      { status, motivoRecusa: status === 'Negado' ? motivoRecusa : '' },
      { new: true }
    );

    if (!updatedReceipt) {
        return NextResponse.json({ ok: false, error: "Comprovante não encontrado" }, { status: 404 });
    }

    // Here you would also update the related invoice status
    // await Fatura.findByIdAndUpdate(updatedReceipt.faturaId, { status: 'Paga' });

    return NextResponse.json({ ok: true, receipt: updatedReceipt });

  } catch (err: any) {
    console.error(`Erro /api/admin/receipts/${params.id}:`, err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
