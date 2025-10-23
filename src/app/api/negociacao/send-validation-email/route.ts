// /src/app/api/negociacao/send-validation-email/route.ts
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const BREVO_API = 'https://api.brevo.com/v3/smtp/email';
const BREVO_KEY = process.env.BREVO_API_KEY; 
const SENDER_EMAIL = process.env.SENDER_EMAIL || 'no-reply@pecus.com';
const SITE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const EMAIL_JWT_SECRET = process.env.EMAIL_JWT_SECRET || 'supersecretjwtkey';

if (!BREVO_KEY) {
  console.error('BREVO_API_KEY não definido');
}
if (EMAIL_JWT_SECRET === 'supersecretjwtkey') {
    console.warn("Atenção: EMAIL_JWT_SECRET está usando um valor padrão. Defina uma chave segura em produção.");
}


export async function POST(req: Request) {
  if (!BREVO_KEY) {
    return NextResponse.json({ ok: false, error: "Brevo API Key não configurada." }, { status: 500 });
  }

  try {
    const body = await req.json();
    const { toEmail, toName, contractId, userId, role } = body;
    if (!toEmail || !contractId || !userId || !role) {
      return NextResponse.json({ error: 'Dados insuficientes' }, { status: 400 });
    }

    // Gere token de aceitação (guarde no DB se quiser auditar)
    const token = jwt.sign(
      { contractId, userId, role },
      EMAIL_JWT_SECRET,
      { expiresIn: '24h' }
    );

    const validateUrl = `${SITE_URL}/api/negociacao/validate-email?token=${encodeURIComponent(token)}`;

    // Monta o payload para Brevo (SMTP endpoint)
    const payload = {
      sender: { name: "PECU'S INTERMEDIATE", email: SENDER_EMAIL },
      to: [{ email: toEmail, name: toName || 'Usuário' }],
      subject: 'Valide seu contrato - PECU\'S INTERMEDIATE',
      htmlContent: `
        <div style="font-family:Arial, sans-serif; text-align:center; padding: 20px; color: #333;">
          <h2 style="color: #22c55e;">Confirme seu aceite de contrato</h2>
          <p>Olá, ${toName || 'Usuário'}!</p>
          <p>Seu contrato referente à negociação foi validado e aguarda seu aceite. Por favor, clique no botão abaixo para confirmar sua concordância com os termos.</p>
          <p style="margin: 30px 0;">
            <a href="${validateUrl}" 
               style="background-color:#22c55e; color:white; padding:12px 25px; border-radius:5px; text-decoration:none; font-weight:bold;">
               Confirmar Aceite e Prosseguir
            </a>
          </p>
          <p style="color: #777; font-size: 12px;">Se você não iniciou esta negociação, por favor, ignore este e-mail.</p>
          <p style="color: #999; font-size: 12px;">Este link de confirmação expira em 24 horas.</p>
        </div>
      `
    };

    const res = await fetch(BREVO_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': BREVO_KEY
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const text = await res.text();
      console.error('Brevo responded with error:', res.status, text);
      return NextResponse.json({ error: 'Erro enviando e-mail', details: text }, { status: 502 });
    }

    return NextResponse.json({ ok: true, message: 'Email de validação enviado com sucesso!' });
  } catch (err) {
    console.error('send-validation-email error', err);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
