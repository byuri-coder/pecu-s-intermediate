
import { NextResponse } from "next/server";

const setCorsHeaders = (response: NextResponse) => {
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  return response;
};

export async function OPTIONS() {
  return setCorsHeaders(new NextResponse(null, { status: 204 }));
}

export async function POST(req: Request) {
  try {
    console.log("🚀 Nova requisição recebida em /api/send-email");

    // Tenta ler o corpo da requisição
    let body;
    try {
      body = await req.json();
    } catch (err) {
      console.error("❌ Erro ao ler body:", err);
      return setCorsHeaders(
        NextResponse.json({ error: "Body inválido ou ausente." }, { status: 400 })
      );
    }

    console.log("📨 Corpo recebido:", body);

    const { vendorEmail, buyerEmail, subject, htmlContent } = body;

    if (!vendorEmail || !buyerEmail || !subject || !htmlContent) {
      console.error("⚠️ Parâmetros ausentes no body!");
      return setCorsHeaders(
        NextResponse.json({ error: "Parâmetros ausentes." }, { status: 400 })
      );
    }

    const apiKey = process.env.BREVO_API_KEY;
    const senderEmail = process.env.SENDER_EMAIL;

    if (!apiKey || !senderEmail) {
      console.error("⚠️ Variáveis de ambiente ausentes!");
      return setCorsHeaders(
        NextResponse.json(
          { error: "Configuração do servidor ausente (BREVO_API_KEY ou SENDER_EMAIL)." },
          { status: 500 }
        )
      );
    }

    const emailData = {
      sender: { email: senderEmail, name: "PECU'S Plataforma" },
      to: [
        { email: vendorEmail },
        { email: buyerEmail },
      ],
      subject,
      htmlContent,
    };

    console.log("📦 Enviando dados ao Brevo:", JSON.stringify(emailData, null, 2));

    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "accept": "application/json",
        "api-key": apiKey,
        "content-type": "application/json",
      },
      body: JSON.stringify(emailData),
    });

    console.log("📬 Status do Brevo:", response.status);
    const data = await response.json().catch(() => ({}));
    console.log("📭 Resposta do Brevo:", data);

    if (!response.ok) {
      console.error("❌ Falha ao enviar o e-mail:", data);
      return setCorsHeaders(
        NextResponse.json({ error: "Falha ao enviar o e-mail.", details: data }, { status: response.status })
      );
    }

    console.log("✅ E-mail enviado com sucesso!");
    return setCorsHeaders(NextResponse.json({ success: true, data }));

  } catch (error: any) {
    console.error("💥 Erro interno:", error);
    return setCorsHeaders(
      NextResponse.json(
        { error: "Erro interno ao enviar o e-mail.", details: error.message },
        { status: 500 }
      )
    );
  }
}
