// src/app/api/contratos/create/route.ts
import { NextResponse } from "next/server";
import { connectMongo } from "@/lib/mongodb";
import { Contrato } from "@/models/Contrato";

export async function POST(req: Request) {
  try {
    await connectMongo();
    const body = await req.json();
    const { uidFirebaseSeller, uidFirebaseBuyer, anuncioId, dados } = body;

    if (!uidFirebaseSeller || !anuncioId) {
      return NextResponse.json({ ok: false, error: "uidFirebaseSeller e anuncioId são obrigatórios" }, { status: 400 });
    }

    const contrato = await Contrato.create({
      uidFirebaseSeller,
      uidFirebaseBuyer,
      anuncioId,
      dados,
      status: "pendente",
    });

    return NextResponse.json({ ok: true, contrato });
  } catch (err: any) {
    console.error("Erro /api/contratos/create:", err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
