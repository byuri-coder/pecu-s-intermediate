
// /src/app/api/negociacao/validate-email/route.ts
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectDB } from '@/lib/mongodb';
import { Contrato } from '@/models/Contrato';

const EMAIL_JWT_SECRET = process.env.EMAIL_JWT_SECRET || 'supersecretjwtkey';
const SITE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const token = url.searchParams.get('token');
    
    if (!token) {
        console.log("Token não fornecido na URL de validação.");
        return NextResponse.redirect(`${SITE_URL}/aceite-erro`);
    }

    const payload = jwt.verify(token, EMAIL_JWT_SECRET) as any;
    const { contractId, userId, role } = payload;

    if (!contractId || !role) {
        console.error("Payload do token inválido:", payload);
        return NextResponse.redirect(`${SITE_URL}/aceite-erro`);
    }

    await connectDB();
    const contract = await Contrato.findById(contractId);

    if (!contract) {
        console.log(`Contrato não encontrado para ID: ${contractId}`);
        return NextResponse.redirect(`${SITE_URL}/aceite-erro`);
    }

    // Garante que a etapa anterior foi concluída
    if (contract.step < 2) {
        console.log(`Tentativa de validação de e-mail antes do acordo de termos para o contrato ${contractId}.`);
        return NextResponse.redirect(`${SITE_URL}/aceite-erro`);
    }

    if (role === 'buyer' || role === 'seller') {
        // Evita revalidar
        if (!contract.emailValidation[role].validated) {
            contract.emailValidation[role] = { validated: true, timestamp: new Date() };
        }
    } else {
        console.log(`Role inválida no token: ${role}`);
        return NextResponse.redirect(`${SITE_URL}/aceite-erro`);
    }

    // Se ambos validaram, avança para a próxima etapa.
    if (contract.emailValidation.buyer.validated && contract.emailValidation.seller.validated) {
      contract.status = 'validated';
      contract.step = 3;
    }

    await contract.save();
    
    // Redireciona para uma página de sucesso
    return NextResponse.redirect(`${SITE_URL}/aceite-sucesso`);
  } catch (err: any) {
    console.error('Erro na validação de e-mail:', err.message);
    if (err.name === 'TokenExpiredError' || err.name === 'JsonWebTokenError') {
        return NextResponse.redirect(`${SITE_URL}/aceite-erro`);
    }
    return NextResponse.redirect(`${SITE_URL}/aceite-erro`);
  }
}
