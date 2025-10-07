
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
    const body = await req.json();
    console.log("📨 Recebendo requisição de envio de e-mail:", body);
    const { vendorEmail, buyerEmail, subject, htmlContent } = body;

    if (!vendorEmail || !buyerEmail || !subject || !htmlContent) {
        return setCorsHeaders(NextResponse.json({ error: "Parâmetros ausentes." }, { status: 400 }));
    }

    const apiKey = process.env.BREVO_API_KEY;
    const senderEmail = process.env.SENDER_EMAIL;

    if (!apiKey || !senderEmail) {
      return setCorsHeaders(NextResponse.json(
        { error: "Configuração do servidor ausente (BREVO_API_KEY ou SENDER_EMAIL)." },
        { status: 500 }
      ));
    }
    
    const emailData = {
      sender: { email: senderEmail, name: "PECU'S Plataforma" },
      to: [
        { email: vendorEmail },
        { email: buyerEmail }
      ],
      subject,
      htmlContent,
    };

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
      console.error("❌ Erro ao enviar via Brevo:");
      console.error("Status:", response.status);
      console.error("Headers:", Object.fromEntries(response.headers.entries()));
      console.error("Corpo da resposta:", data);
      return setCorsHeaders(NextResponse.json({ error: "Falha ao enviar o e-mail.", details: data }, { status: response.status }));
    }
    
    console.log("✅ Resposta do Brevo:", data);
    return setCorsHeaders(NextResponse.json({ success: true, data }));

  } catch (error: any) {
    console.error("Erro geral:", error);
    return setCorsHeaders(NextResponse.json(
      { error: "Erro interno ao enviar o e-mail.", details: error.message },
      { status: 500 }
    ));
  }
}
