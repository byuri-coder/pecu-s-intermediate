
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  try {
    const { to, subject, html } = await request.json();

    // Validação básica dos dados recebidos
    if (!to || !subject || !html) {
      return NextResponse.json({ message: 'Campos obrigatórios (to, subject, html) ausentes.' }, { status: 400 });
    }

    // Configuração do Nodemailer com as variáveis de ambiente
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_PORT === '465', // true para a porta 465, false para as outras
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Opções do e-mail
    const mailOptions = {
      from: `"PECU'S INTERMEDIATE" <${process.env.SMTP_USER}>`,
      to: to,
      subject: subject,
      html: html,
    };

    // Envio do e-mail
    await transporter.sendMail(mailOptions);

    // Retorno de sucesso
    return NextResponse.json({ success: true, message: 'E-mail enviado com sucesso!' });

  } catch (error: any) {
    // Log do erro no servidor para depuração
    console.error('Erro no envio de e-mail:', error);

    // Retorno de erro genérico para o cliente
    return NextResponse.json({ message: 'Ocorreu um erro interno no servidor ao tentar enviar o e-mail.', error: error.message }, { status: 500 });
  }
}
