// src/app/api/negociacao/finalizar/route.ts
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Contrato } from '@/models/Contrato';
import { Anuncio } from '@/models/Anuncio';

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
    
    // Update the asset status to "Vendido"
    await Anuncio.findByIdAndUpdate(contract.anuncioId, { status: 'Vendido' });

    // Update the contract status
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
