// /src/app/api/send-email/route.ts
import { NextResponse } from 'next/server';

const BREVO_API = 'https://api.brevo.com/v3/smtp/email';
const BREVO_KEY = process.env.BREVO_API_KEY;
const SENDER_EMAIL = process.env.SENDER_EMAIL || 'no-reply@pecus.com';

if (!BREVO_KEY) {
  console.error('BREVO_API_KEY não definido');
}

export async function POST(req: Request) {
  if (!BREVO_KEY) {
    return NextResponse.json({ error: "Brevo API Key não configurada." }, { status: 500 });
  }

  try {
    const body = await req.json();
    const { to_email, to_name, subject, html_content } = body;

    if (!to_email || !subject || !html_content) {
        return NextResponse.json({ error: "Parâmetros de e-mail obrigatórios ausentes." }, { status: 400 });
    }
    
    const payload = {
      sender: { name: "PECU'S INTERMEDIATE", email: SENDER_EMAIL },
      to: [{ email: to_email, name: to_name || 'Usuário' }],
      subject: subject,
      htmlContent: html_content
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
    
    const data = await res.json();
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error("send-email error:", error);
    return NextResponse.json({ error: error.message || "Failed to send email." }, { status: 500 });
  }
}
