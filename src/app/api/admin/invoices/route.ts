// src/app/api/admin/invoices/route.ts
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Fatura } from "@/models/Fatura";
import { Usuario } from "@/models/Usuario";

export async function GET(req: Request) {
  try {
    const db = await connectDB();
    if (!db) {
      return NextResponse.json({ ok: true, invoices: [] });
    }

    const invoices = await Fatura.find({})
      .populate({ path: 'usuarioId', model: Usuario, select: 'nome' })
      .sort({ dataEmissao: -1 })
      .lean();
      
    const formattedInvoices = invoices.map(inv => ({
        id: inv._id,
        numero: inv.numero,
        tomador: inv.usuarioId,
        status: inv.status,
        valor: inv.valor,
        dataEmissao: inv.dataEmissao,
    }))

    return NextResponse.json({ ok: true, invoices: formattedInvoices });

  } catch (err: any) {
    console.error("Erro /api/admin/invoices:", err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
