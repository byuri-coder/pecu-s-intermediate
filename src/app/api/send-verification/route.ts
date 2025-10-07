
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import axios from 'axios';

const JWT_SECRET = process.env.EMAIL_JWT_SECRET || 'your-super-secret-jwt-key';
const RENDER_EMAIL_SERVICE_URL = process.env.RENDER_EMAIL_SERVICE_URL;

/**
 * Função para chamar o backend de e-mail no Render.
 * @param userEmail - O e-mail do destinatário.
 * @param contractHtml - O corpo do e-mail em HTML.
 * @returns boolean - Retorna true se o e-mail foi enviado com sucesso, false caso contrário.
 */
export async function sendContractEmail(userEmail: string, contractHtml: string): Promise<boolean> {
  const url = process.env.RENDER_EMAIL_SERVICE_URL;
  if (!url) {
    console.error("A URL do serviço de e-mail no Render não está configurada.");
    return false;
  }

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: userEmail,
        subject: "Confirmação de contrato - Pecu’s Intermediate",
        html: contractHtml,
      }),
    });

    if (response.ok) {
        const result = await response.json();
        if (result.success) {
            console.log("✅ E-mail enviado com sucesso!");
            return true;
        } else {
            console.error("❌ Falha ao enviar e-mail:", result.error);
            return false;
        }
    } else {
        console.error(`❌ Erro na resposta do servidor de e-mail: ${response.status} ${response.statusText}`);
        const errorBody = await response.text();
        console.error("Corpo do erro:", errorBody);
        return false;
    }
  } catch (err: any) {
    console.error("❌ Erro na conexão com o backend de e-mail:", err.message);
    return false;
  }
}


export async function POST(request: Request) {
  try {
    const { email, role } = await request.json();

    if (!email || !role) {
      return NextResponse.json({ message: 'E-mail e função (role) são obrigatórios.' }, { status: 400 });
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

    // Delega o envio do e-mail para o serviço externo usando a nova função
    const emailSent = await sendContractEmail(email, mailHtml);

    if (emailSent) {
        return NextResponse.json({ message: 'E-mail de verificação enviado com sucesso!' });
    } else {
        return NextResponse.json({ message: 'Ocorreu um erro no servidor ao tentar enviar o e-mail.' }, { status: 500 });
    }

  } catch (error: any) {
    console.error('Erro na rota /api/send-verification:', error.message);
    return NextResponse.json({ message: 'Ocorreu um erro interno no servidor.' }, { status: 500 });
  }
}
