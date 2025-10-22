// src/app/api/negociacao/update-contract/route.ts
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Contrato } from '@/models/Contrato';
import { get, set } from 'lodash';

export async function POST(req: Request) {
  try {
    await connectDB();
    const { negotiationId, updates } = await req.json();

    if (!negotiationId || !updates) {
      return NextResponse.json({ ok: false, error: 'negotiationId e updates são obrigatórios' }, { status: 400 });
    }

    const contract = await Contrato.findOne({ negotiationId });
    if (!contract) {
      return NextResponse.json({ ok: false, error: 'Contrato não encontrado' }, { status: 404 });
    }
    
    // Apply updates using lodash for safety with nested paths
    Object.keys(updates).forEach(key => {
        set(contract, key, updates[key]);
    });

    await contract.save();

    return NextResponse.json({ ok: true, contract });
  } catch (error: any) {
    console.error("Erro em /api/negociacao/update-contract:", error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
