// src/app/api/duplicatas/route.ts
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Duplicata } from '@/models/Duplicata';
import { Usuario } from '@/models/Usuario';
import { Contrato } from '@/models/Contrato';

async function getDealsFromDuplicates(duplicates: any[], userCnpj: string) {
    const dealsMap = new Map();

    for (const dup of duplicates) {
        if (!dealsMap.has(dup.negotiationId)) {
            const contract = await Contrato.findOne({ _id: `contract_${dup.negotiationId.split('_')[1]}` }).lean();
            if (contract) {
                dealsMap.set(dup.negotiationId, {
                    assetId: dup.negotiationId.split('_')[1],
                    assetName: "Nome do Ativo (Buscar)", // You would fetch this from the Anuncio model
                    duplicates: [],
                    seller: { name: contract.dados.fields.seller.razaoSocial, doc: contract.dados.fields.seller.cnpj, address: contract.dados.fields.seller.endereco },
                    buyer: { name: contract.dados.fields.buyer.razaoSocial, doc: contract.dados.fields.buyer.cnpj, address: contract.dados.fields.buyer.endereco },
                    blockchain: {
                        transactionHash: '0x' + [...Array(64)].map(() => Math.floor(Math.random() * 16).toString(16)).join(''),
                        blockTimestamp: new Date(contract.finalizedAt).toISOString()
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
    
    // First, get the user's CNPJ/CPF from their profile
    const user = await Usuario.findOne({ uidFirebase: userId }).lean();
    if (!user) {
      return NextResponse.json({ ok: true, deals: [] });
    }
    const userDocIdentifier = user.cpfCnpj; // Assuming you add this field to the user model

    // Find all duplicates where this user is either the buyer or the seller
    const userDuplicates = await Duplicata.find({
        $or: [
            { buyerId: userDocIdentifier },
            { sellerId: userDocIdentifier }
        ]
    }).sort({ issueDate: -1 }).lean();

    const deals = await getDealsFromDuplicates(userDuplicates, userDocIdentifier);
    
    return NextResponse.json({ ok: true, deals });

  } catch (error: any) {
    console.error('Error fetching duplicates:', error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
