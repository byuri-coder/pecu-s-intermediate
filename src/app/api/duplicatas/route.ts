// src/app/api/duplicatas/route.ts
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Duplicata } from '@/models/Duplicata';
import { Usuario } from '@/models/Usuario';
import { Contrato } from '@/models/Contrato';
import { Anuncio } from '@/models/Anuncio';

async function getDealsFromDuplicates(duplicates: any[], userId: string) {
    const dealsMap = new Map();

    for (const dup of duplicates) {
        if (!dealsMap.has(dup.negotiationId)) {
            const contract = await Contrato.findOne({ negotiationId: dup.negotiationId }).lean();
            if (contract) {
                const anuncio = await Anuncio.findById(contract.anuncioId).lean();
                dealsMap.set(dup.negotiationId, {
                    assetId: contract.anuncioId,
                    assetName: anuncio?.titulo || 'Ativo não encontrado',
                    duplicates: [],
                    seller: { name: contract.fields.seller.razaoSocial, doc: contract.fields.seller.cnpj, address: contract.fields.seller.endereco },
                    buyer: { name: contract.fields.buyer.razaoSocial, doc: contract.fields.buyer.cnpj, address: contract.fields.buyer.endereco },
                    blockchain: {
                        transactionHash: '0x' + [...Array(64)].map(() => Math.floor(Math.random() * 16).toString(16)).join(''),
                        blockTimestamp: contract.completedAt ? new Date(contract.completedAt).toISOString() : new Date().toISOString()
                    }
                });
            }
        }

        if (dealsMap.has(dup.negotiationId)) {
            const deal = dealsMap.get(dup.negotiationId);
            deal.duplicates.push({
                ...dup,
                issueDate: new Date(dup.issueDate).toLocaleDateString('pt-BR'),
                dueDate: new Date(dup.dueDate).toLocaleDateString('pt-BR'),
            });
        }
    }
    return Array.from(dealsMap.values());
}


export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ ok: false, error: 'ID do usuário é obrigatório' }, { status: 400 });
    }
    
    // Find all duplicates where this user is either the buyer or the seller
    const userDuplicates = await Duplicata.find({
        $or: [
            { buyerId: userId },
            { sellerId: userId }
        ]
    }).sort({ issueDate: -1 }).lean();

    const deals = await getDealsFromDuplicates(userDuplicates, userId);
    
    return NextResponse.json({ ok: true, deals });

  } catch (error: any) {
    console.error('Error fetching duplicates:', error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
