// src/app/api/negociacao/aceite/route.ts
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Contrato } from '@/models/Contrato';

export async function POST(req: Request) {
  try {
    await connectDB();
    const { negotiationId, role } = await req.json();

    if (!negotiationId || !role) {
      return NextResponse.json({ ok: false, error: 'negotiationId e role são obrigatórios' }, { status: 400 });
    }

    const contract = await Contrato.findOne({ negotiationId });
    if (!contract) {
      return NextResponse.json({ ok: false, error: 'Contrato não encontrado' }, { status: 404 });
    }

    if (role === 'buyer' || role === 'seller') {
        contract.acceptances[role] = { accepted: true, date: new Date() };
    } else {
        return NextResponse.json({ ok: false, error: 'Role inválida' }, { status: 400 });
    }

    // Se ambos aceitaram, avança o estado
    if (contract.acceptances.buyer.accepted && contract.acceptances.seller.accepted) {
      contract.status = 'frozen';
      contract.step = 2;
    }

    await contract.save();

    return NextResponse.json({ ok: true, contract });
  } catch (error: any) {
    console.error("Erro em /api/negociacao/aceite:", error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
