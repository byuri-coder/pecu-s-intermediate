import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import axios from 'axios';

// As variáveis de ambiente são configuradas no seu arquivo .env
const JWT_SECRET = process.env.EMAIL_JWT_SECRET || 'your-super-secret-jwt-key';
const RENDER_EMAIL_SERVICE_URL = process.env.RENDER_EMAIL_SERVICE_URL; // URL do seu backend no Render

export async function POST(request: Request) {
  try {
    const { email, role } = await request.json();

    if (!email || !role) {
      return NextResponse.json({ message: 'E-mail e função (role) são obrigatórios.' }, { status: 400 });
    }

    if (!RENDER_EMAIL_SERVICE_URL) {
        console.error("A URL do serviço de e-mail no Render não está configurada.");
        return NextResponse.json({ message: 'O serviço de e-mail não está configurado corretamente no servidor.' }, { status: 500 });
    }

    // Cria um JWT que expira em 24 horas
    const token = jwt.sign({ email, role }, JWT_SECRET, { expiresIn: '24h' });

    // Constrói o link de verificação
    const baseUrl = process.env.NEXT_PUBLIC_APP_BASE_URL || 'http://localhost:3000';
    const verificationLink = `${baseUrl}/api/verify-acceptance?token=${token}`;

    const mailHtml = `
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
      `;

    // Delega o envio do e-mail para o serviço externo no Render
    await axios.post(RENDER_EMAIL_SERVICE_URL, {
        to: email,
        subject: "Confirme a autenticidade do seu contrato",
        html: mailHtml,
    });

    return NextResponse.json({ message: 'E-mail de verificação enviado com sucesso!' });

  } catch (error: any) {
    console.error('Erro ao chamar o serviço de e-mail externo:', error.response?.data || error.message);
    return NextResponse.json({ message: 'Ocorreu um erro no servidor ao tentar enviar o e-mail.' }, { status: 500 });
  }
}
