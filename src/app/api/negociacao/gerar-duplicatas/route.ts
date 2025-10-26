// src/app/api/negociacao/gerar-duplicatas/route.ts
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Duplicata } from '@/models/Duplicata';
import { Fatura } from '@/models/Fatura';
import { Contrato } from '@/models/Contrato';
import { Usuario } from '@/models/Usuario';
import type { Asset, CompletedDeal } from '@/lib/types';
import mongoose from 'mongoose';

// This should come from a config file or environment variable
const SERVICE_FEE_PERCENTAGE = 0.05; // 5%

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();

    const { assetId, contract, asset } = body;
    const negotiationId = `neg_${assetId}`;

    if (!contract || !asset) {
      return NextResponse.json({ ok: false, error: 'Dados do contrato ou ativo ausentes.' }, { status: 400 });
    }
    
    // --- 1. Generate and Save Duplicates ---
    const totalValue = (asset.price || (asset.pricePerCredit && asset.quantity ? asset.pricePerCredit * asset.quantity : 0)) || 0;
    const installments = parseInt(contract.fields.seller.installments, 10) || 1;
    const installmentValue = totalValue / installments;
    const today = new Date();
    
    const duplicatesToCreate = [];
    for (let i = 0; i < installments; i++) {
        const dueDate = new Date(today);
        dueDate.setMonth(today.getMonth() + i + 1);
        duplicatesToCreate.push({
            negotiationId: negotiationId,
            orderNumber: `${i + 1}/${installments}`,
            invoiceNumber: `NF-${assetId.substring(0, 6)}-${i+1}`,
            issueDate: today,
            dueDate: dueDate,
            value: installmentValue,
            buyerId: contract.buyerId, // Use the firebase UID
            sellerId: contract.sellerId, // Use the firebase UID
        });
    }

    await Duplicata.insertMany(duplicatesToCreate);

    // --- 2. Generate and Save Service Fee Invoice ---
    const serviceFee = totalValue * SERVICE_FEE_PERCENTAGE;
    const feeDueDate = new Date();
    feeDueDate.setDate(today.getDate() + 7); // 7 days to pay

    const relatedContract = await Contrato.findOne({ negotiationId: negotiationId }).lean();
    if (!relatedContract) {
      throw new Error(`Contrato com negotiationId ${negotiationId} não encontrado para gerar fatura.`);
    }

    const sellerUser = await Usuario.findOne({ uidFirebase: contract.sellerId }).lean();
    if (!sellerUser) {
        throw new Error(`Usuário vendedor com uidFirebase ${contract.sellerId} não encontrado.`);
    }

    await Fatura.create({
        usuarioId: sellerUser._id,
        contratoId: relatedContract._id,
        numero: `FEE-${assetId.substring(0, 8)}`,
        valor: serviceFee,
        dataVencimento: feeDueDate,
        status: 'Pendente',
        description: `Taxa de serviço sobre negociação: ${asset.title}`
    });

    // --- 3. Return the generated deal object for frontend display ---
    const deal: CompletedDeal = {
        assetId: assetId,
        assetName: asset.title,
        duplicates: duplicatesToCreate.map(d => ({...d, issueDate: d.issueDate.toLocaleDateString('pt-BR'), dueDate: d.dueDate.toLocaleDateString('pt-BR') })),
        seller: { name: contract.fields.seller.razaoSocial, doc: contract.fields.seller.cnpj, address: contract.fields.seller.endereco },
        buyer: { name: contract.fields.buyer.razaoSocial, doc: contract.fields.buyer.cnpj, address: contract.fields.buyer.endereco },
        blockchain: {
            transactionHash: '0x' + [...Array(64)].map(() => Math.floor(Math.random() * 16).toString(16)).join(''),
            blockTimestamp: new Date().toISOString()
        }
    };
    
    return NextResponse.json({ ok: true, deal });

  } catch (error: any) {
    console.error('Error generating duplicates:', error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
