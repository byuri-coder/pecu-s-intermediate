// src/app/api/negociacao/verify-acceptance/route.ts
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { Contrato } from '@/models/Contrato';
import { connectDB } from '@/lib/mongodb';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkey';
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');
    
    if (!token) {
      console.log("Token não fornecido na URL");
      return NextResponse.redirect(`${BASE_URL}/aceite-erro`);
    }

    const decoded: any = jwt.verify(token, JWT_SECRET);
    const { contractId, role } = decoded;

    await connectDB();
    
    const contract = await Contrato.findById(contractId);
    if (!contract) {
        console.log(`Contrato não encontrado para ID: ${contractId}`);
        return NextResponse.redirect(`${BASE_URL}/aceite-erro`);
    }

    if (role === 'buyer' || role === 'seller') {
        // Evita re-escrever se já foi validado
        if (!contract.emailValidation[role].validated) {
            contract.emailValidation[role] = { validated: true, timestamp: new Date() };
        }
    } else {
        console.log(`Role inválida: ${role}`);
        return NextResponse.redirect(`${BASE_URL}/aceite-erro`);
    }

    // Se ambos validaram, avança o estado
    if (contract.emailValidation.buyer.validated && contract.emailValidation.seller.validated) {
      contract.status = 'validated';
      contract.step = 3;
    }

    await contract.save();

    // Redireciona para a página de sucesso
    return NextResponse.redirect(`${BASE_URL}/aceite-sucesso`);

  } catch (err: any) {
    console.error("Erro ao validar token:", err);
    // Token inválido, expirado ou erro no banco
    return NextResponse.redirect(`${BASE_URL}/aceite-erro`);
  }
}
