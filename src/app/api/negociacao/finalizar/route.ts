// src/app/api/negociacao/finalizar/route.ts
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Contrato } from '@/models/Contrato';

export async function POST(req: Request) {
  try {
    await connectDB();
    const { negotiationId } = await req.json();

    if (!negotiationId) {
      return NextResponse.json({ ok: false, error: 'negotiationId é obrigatório' }, { status: 400 });
    }

    const contract = await Contrato.findOne({ negotiationId });
    if (!contract) {
      return NextResponse.json({ ok: false, error: 'Contrato não encontrado' }, { status: 404 });
    }

    if (contract.step < 3) {
      return NextResponse.json({ ok: false, error: 'Etapas anteriores não foram concluídas' }, { status: 400 });
    }

    // Adicione aqui a lógica para verificar se os documentos foram enviados por ambos
    // if (!contract.documents.buyer.fileUrl || !contract.documents.seller.fileUrl) {
    //   return NextResponse.json({ ok: false, error: 'Documentos pendentes de upload' }, { status: 400 });
    // }

    contract.status = 'completed';
    contract.step = 4;
    contract.completedAt = new Date();
    await contract.save();

    return NextResponse.json({ ok: true, contract });
  } catch (error: any) {
    console.error("Erro em /api/negociacao/finalizar:", error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
