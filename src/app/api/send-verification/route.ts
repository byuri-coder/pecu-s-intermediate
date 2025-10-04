import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import jwt from 'jsonwebtoken';

// This would typically be in a more secure place, like environment variables
const EMAIL_USER = process.env.EMAIL_USER || 'your-email@example.com';
const EMAIL_PASS = process.env.EMAIL_PASS || 'your-email-password';
const JWT_SECRET = process.env.EMAIL_JWT_SECRET || 'your-super-secret-jwt-key';

// Basic SMTP transporter setup
const transporter = nodemailer.createTransport({
  service: 'gmail', // Example with Gmail, use your own SMTP provider
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

export async function POST(request: Request) {
  try {
    const { email, role } = await request.json();

    if (!email || !role) {
      return NextResponse.json({ message: 'E-mail e função (role) são obrigatórios.' }, { status: 400 });
    }

    // Create a JWT that expires in 24 hours
    const token = jwt.sign({ email, role }, JWT_SECRET, { expiresIn: '24h' });

    // Construct the verification link
    const baseUrl = process.env.NEXT_PUBLIC_APP_BASE_URL || 'http://localhost:3000';
    const verificationLink = `${baseUrl}/api/verify-acceptance?token=${token}`;

    const mailOptions = {
      from: `"PECU'S INTERMEDIATE" <${EMAIL_USER}>`,
      to: email,
      subject: 'Confirme a autenticidade do seu contrato',
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2>Olá!</h2>
          <p>Você está finalizando um contrato em nossa plataforma.</p>
          <p>Para garantir a segurança de todos, por favor, clique no botão abaixo para confirmar a autenticidade do documento e registrar seu aceite.</p>
          <a href="${verificationLink}" 
             style="display: inline-block; background-color: #22c55e; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">
             Confirmar e Validar Contrato
          </a>
          <br><br>
          <p>Se o botão não funcionar, copie e cole o seguinte link no seu navegador:</p>
          <p><a href="${verificationLink}">${verificationLink}</a></p>
          <br>
          <small>Este link é válido por 24 horas.</small>
          <p>Atenciosamente,<br>Equipe PECU'S INTERMEDIATE</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ message: 'E-mail de verificação enviado com sucesso!' });

  } catch (error) {
    console.error('Erro ao enviar e-mail:', error);
    return NextResponse.json({ message: 'Ocorreu um erro no servidor ao tentar enviar o e-mail.' }, { status: 500 });
  }
}
