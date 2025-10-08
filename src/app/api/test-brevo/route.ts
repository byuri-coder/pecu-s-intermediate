import { NextResponse } from "next/server";

export async function GET() {
  try {
    const apiKey = process.env.BREVO_API_KEY;
    const senderEmail = process.env.SENDER_EMAIL;

    if (!apiKey || !senderEmail) {
      console.error("⚠️ Variáveis de ambiente ausentes (BREVO_API_KEY ou SENDER_EMAIL)!");
      return NextResponse.json({ error: "Configuração do servidor ausente." }, { status: 500 });
    }

    const emailData = {
      sender: { email: senderEmail, name: "PECU'S Plataforma" },
      to: [{ email: "byuripaulo@gmail.com" }],
      subject: "Teste automático PECU'S",
      htmlContent: "<h1>Envio de teste bem-sucedido!</h1><p>O sistema está funcionando 🎉</p>",
    };

    console.log("📦 Enviando dados de teste ao Brevo:", JSON.stringify(emailData, null, 2));

    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "accept": "application/json",
        "api-key": apiKey,
        "content-type": "application/json",
      },
      body: JSON.stringify(emailData),
    });

    const data = await response.json();
    console.log("📬 Resposta Brevo:", data);

    if (!response.ok) {
        console.error("❌ Falha ao enviar o e-mail de teste:", data);
    } else {
        console.log("✅ E-mail de teste enviado com sucesso!");
    }

    return NextResponse.json({ success: response.ok, data });

  } catch (error: any) {
    console.error("💥 Erro interno ao testar Brevo:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
