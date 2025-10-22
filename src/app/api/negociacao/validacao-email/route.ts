// src/app/api/negociacao/validacao-email/route.ts
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
    
    if (contract.step < 2) {
        return NextResponse.json({ ok: false, error: 'Os termos ainda não foram aceitos por ambas as partes.' }, { status: 400 });
    }

    if (role === 'buyer' || role === 'seller') {
        contract.emailValidation[role] = { validated: true, timestamp: new Date() };
    } else {
        return NextResponse.json({ ok: false, error: 'Role inválida' }, { status: 400 });
    }

    // Se ambos validaram, avança o estado
    if (contract.emailValidation.buyer.validated && contract.emailValidation.seller.validated) {
      contract.status = 'validated';
      contract.step = 3;
    }

    await contract.save();

    return NextResponse.json({ ok: true, contract });
  } catch (error: any)
   {
    console.error("Erro em /api/negociacao/validacao-email:", error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
