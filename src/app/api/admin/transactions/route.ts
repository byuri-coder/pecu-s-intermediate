// src/app/api/admin/transactions/route.ts
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Contrato } from "@/models/Contrato";
import { Anuncio } from "@/models/Anuncio";
import { Usuario } from "@/models/Usuario";

export async function GET(req: Request) {
  try {
    const db = await connectDB();
    if (!db) {
      return NextResponse.json({ ok: false, error: "Database not connected" }, { status: 500 });
    }

    const transactions = await Contrato.find({ status: 'assinado' })
      .populate({ path: 'anuncioId', model: Anuncio })
      .populate({ path: 'uidFirebaseBuyer', model: Usuario, select: 'nome email' })
      .sort({ createdAt: -1 })
      .lean();
      
    const formattedTransactions = transactions.map(tx => ({
        ...tx,
        anuncio: tx.anuncioId,
        buyer: tx.uidFirebaseBuyer,
        price: (tx.anuncioId as any)?.price,
        status: (tx.anuncioId as any)?.status
    }))

    return NextResponse.json({ ok: true, transactions: formattedTransactions });

  } catch (err: any) {
    console.error("Erro /api/admin/transactions:", err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
