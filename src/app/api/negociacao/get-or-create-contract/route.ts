// src/app/api/negociacao/get-or-create-contract/route.ts
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Contrato } from '@/models/Contrato';
import { Anuncio } from '@/models/Anuncio';

export async function POST(req: Request) {
  try {
    await connectDB();
    const { negotiationId, buyerId, sellerId, anuncioId } = await req.json();

    if (!negotiationId || !buyerId || !sellerId || !anuncioId) {
      return NextResponse.json({ ok: false, error: 'Dados obrigatórios ausentes.' }, { status: 400 });
    }

    let contract = await Contrato.findOne({ negotiationId });

    if (!contract) {
        // Find the related asset to pre-fill info if needed
        const asset = await Anuncio.findById(anuncioId).lean();
        
        contract = await Contrato.create({
            negotiationId,
            buyerId,
            sellerId,
            anuncioId,
            fields: {
                // Pre-fill seller info if available from asset, otherwise leave blank
                seller: {
                    razaoSocial: asset?.metadados?.sellerName || '',
                    // ...other pre-fills
                },
                // Pre-fill buyer info if you have it, otherwise leave blank
                buyer: {}
            }
        });
    }
    
    return NextResponse.json({ ok: true, contract });

  } catch (error: any) {
    console.error("Erro em /api/negociacao/get-or-create-contract:", error);
    // Handle potential race condition where two requests create the same contract
    if (error.code === 11000) {
        const contract = await Contrato.findOne({ negotiationId: (await req.json()).negotiationId });
        return NextResponse.json({ ok: true, contract });
    }
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
