
import { NextResponse } from "next/server";

const setCorsHeaders = (response: NextResponse) => {
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return response;
};

export async function OPTIONS() {
  let response = new NextResponse(null, { status: 204 });
  return setCorsHeaders(response);
}

export async function POST(req: Request) {
  try {
    const { to, subject, message, vendorEmail, buyerEmail, html } = await req.json();

    // ✅ Validação básica
    if (!to && (!vendorEmail || !buyerEmail) && !html) {
      return setCorsHeaders(NextResponse.json(
        { error: "Destinatário(s) ou conteúdo não informado(s)." },
        { status: 400 }
      ));
    }

    // ✅ Carrega chave Brevo do Render
    const apiKey = process.env.BREVO_API_KEY;
    const senderEmail = process.env.SENDER_EMAIL;

    if (!apiKey || !senderEmail) {
      return setCorsHeaders(NextResponse.json(
        { error: "Configuração do servidor ausente (BREVO_API_KEY ou SENDER_EMAIL)." },
        { status: 500 }
      ));
    }

    // ✅ Monta lista de destinatários dinâmicos
    const recipients: { email: string }[] = [];
    if (to) recipients.push({ email: to });
    if (vendorEmail) recipients.push({ email: vendorEmail });
    if (buyerEmail) recipients.push({ email: buyerEmail });

    // ✅ Corpo do e-mail
    const emailData = {
      sender: { email: senderEmail, name: "PECU'S PLATFORM" },
      to: recipients,
      subject: subject || "Nova mensagem da plataforma PECU'S",
      htmlContent: html || `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2 style="color: #2c3e50;">📩 Mensagem da Plataforma PECU'S</h2>
          <p>${message}</p>
          <hr />
          <p style="font-size: 13px; color: #999;">Este e-mail foi enviado automaticamente. Por favor, não responda.</p>
        </div>
      `
    };

    // ✅ Envio via Brevo API
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "accept": "application/json",
        "api-key": apiKey,
        "content-type": "application/json"
      },
      body: JSON.stringify(emailData)
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("❌ Erro Brevo:", data);
      return setCorsHeaders(NextResponse.json(
        { error: "Falha ao enviar o e-mail.", details: data },
        { status: 500 }
      ));
    }

    console.log("✅ E-mail enviado com sucesso:", data);

    return setCorsHeaders(NextResponse.json({
      success: true,
      message: "E-mail enviado com sucesso.",
      brevoId: data.messageId || null
    }));

  } catch (error: any) {
    console.error("❌ Erro geral:", error);
    return setCorsHeaders(NextResponse.json(
      { error: "Erro interno ao enviar o e-mail.", details: error.message },
      { status: 500 }
    ));
  }
}
