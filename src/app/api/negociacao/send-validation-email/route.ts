// src/app/api/negociacao/send-validation-email/route.ts
import { NextResponse } from 'next/server';
import SibApiV3Sdk from 'sib-api-v3-sdk';
import jwt from 'jsonwebtoken';
import { Contrato } from '@/models/Contrato';
import { connectDB } from '@/lib/mongodb';

const BREVO_API_KEY = process.env.BREVO_API_KEY;
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

if (!BREVO_API_KEY || !JWT_SECRET) {
  console.error("Variáveis de ambiente BREVO_API_KEY ou JWT_SECRET não definidas.");
}

export async function POST(req: Request) {
  try {
    const { negotiationId, role, userEmail, userName } = await req.json();

    if (!negotiationId || !userEmail || !role) {
      return NextResponse.json({ ok: false, error: 'Dados obrigatórios ausentes' }, { status: 400 });
    }

    await connectDB();
    const contract = await Contrato.findOne({ negotiationId });
    if (!contract) {
        return NextResponse.json({ ok: false, error: 'Contrato não encontrado' }, { status: 404 });
    }
    
    // Cria token de validação com expiração de 24h
    const token = jwt.sign({ contractId: contract._id, userEmail, role }, JWT_SECRET, { expiresIn: '24h' });

    const validationUrl = `${BASE_URL}/api/negociacao/verify-acceptance?token=${token}`;

    // Configura SDK Brevo
    const defaultClient = SibApiV3Sdk.ApiClient.instance;
    const apiKey = defaultClient.authentications['api-key'];
    apiKey.apiKey = BREVO_API_KEY;

    const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

    const emailData = {
      sender: { email: 'no-reply@pecusintermediate.com', name: 'PECU’S INTERMEDIATE' },
      to: [{ email: userEmail, name: userName || 'Usuário' }],
      subject: 'Confirmação de Aceite do Contrato',
      htmlContent: `
        <div style="font-family:Arial, sans-serif; text-align:center; padding: 20px;">
          <h2 style="color: #333;">Confirme seu aceite de contrato</h2>
          <p style="color: #555;">Olá, ${userName || 'Usuário'}!</p>
          <p style="color: #555;">Seu contrato foi validado e aguarda seu aceite. Por favor, clique no botão abaixo para confirmar sua concordância com os termos.</p>
          <p style="margin: 30px 0;">
            <a href="${validationUrl}" 
               style="background-color:#10b981; color:white; padding:12px 25px; border-radius:5px; text-decoration:none; font-weight:bold;">
               Confirmar Aceite e Prosseguir
            </a>
          </p>
          <p style="color: #777; font-size: 12px;">Se você não iniciou esta negociação, por favor, ignore este e-mail.</p>
          <p style="color: #999; font-size: 12px;">Este link de confirmação expira em 24 horas.</p>
        </div>
      `,
    };

    await apiInstance.sendTransacEmail(emailData);

    return NextResponse.json({ ok: true, message: 'Email de validação enviado com sucesso!' });
  } catch (error: any) {
    console.error('Erro ao enviar email de validação:', error.response ? error.response.body : error);
    return NextResponse.json({ ok: false, error: error.message || 'Erro interno do servidor' }, { status: 500 });
  }
}
