
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

const setCorsHeaders = (response: NextResponse) => {
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return response;
};

export async function OPTIONS() {
  const response = new NextResponse(null, { status: 204 });
  return setCorsHeaders(response);
}

export async function POST(request: Request) {
  try {
    const { to, subject, html } = await request.json();

    if (!to || !subject || !html) {
      return setCorsHeaders(NextResponse.json({ message: 'Campos obrigatórios (to, subject, html) ausentes.' }, { status: 400 }));
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_PORT === '465',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const mailOptions = {
      from: `"PECU'S INTERMEDIATE" <${process.env.SMTP_USER}>`,
      to: to,
      subject: subject,
      html: html,
    };

    await transporter.sendMail(mailOptions);

    return setCorsHeaders(NextResponse.json({ success: true, message: 'E-mail enviado com sucesso!' }));

  } catch (error: any) {
    console.error('Erro no envio de e-mail:', error);
    return setCorsHeaders(NextResponse.json({ message: 'Ocorreu um erro interno no servidor ao tentar enviar o e-mail.', error: error.message }, { status: 500 }));
  }
}
