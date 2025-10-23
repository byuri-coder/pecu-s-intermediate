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

    await connectDB();
    const contract = await Contrato.findById(contractId);

    if (!contract) {
        console.log(`Contrato não encontrado para ID: ${contractId}`);
        return NextResponse.redirect(`${SITE_URL}/aceite-erro`);
    }

    if (role === 'buyer' || role === 'seller') {
        if (!contract.emailValidation[role].validated) {
            contract.emailValidation[role] = { validated: true, timestamp: new Date() };
        }
    } else {
        console.log(`Role inválida no token: ${role}`);
        return NextResponse.redirect(`${SITE_URL}/aceite-erro`);
    }

    if (contract.emailValidation.buyer.validated && contract.emailValidation.seller.validated) {
      contract.status = 'validated';
      contract.step = 3;
    }

    await contract.save();
    
    return NextResponse.redirect(`${SITE_URL}/aceite-sucesso`);
  } catch (err: any) {
    console.error('validate-email error', err);
    return NextResponse.redirect(`${SITE_URL}/aceite-erro`);
  }
}
