
import { NextResponse } from "next/server";
import SibApiV3Sdk from 'sib-api-v3-sdk';

const BREVO_API_KEY = process.env.BREVO_API_KEY;

if (!BREVO_API_KEY) {
  console.error("BREVO_API_KEY is not set in environment variables.");
}

export async function POST(req: Request) {
  if (!BREVO_API_KEY) {
    return NextResponse.json({ error: "Brevo API Key not configured." }, { status: 500 });
  }
  
  try {
    const body = await req.json();
    const { to_email, to_name, subject, html_content } = body;

    if (!to_email || !subject || !html_content) {
        return NextResponse.json({ error: "Missing required email parameters." }, { status: 400 });
    }

    const defaultClient = SibApiV3Sdk.ApiClient.instance;
    const apiKey = defaultClient.authentications['api-key'];
    apiKey.apiKey = BREVO_API_KEY;

    const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
    
    const sendSmtpEmail = {
        sender: { email: "no-reply@pecusintermediate.com", name: "PECU'S INTERMEDIATE" },
        to: [{ email: to_email, name: to_name || 'Usuário' }],
        subject: subject,
        htmlContent: html_content,
    };

    const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
    
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error("Brevo API Error:", error.response ? error.response.body : error);
    return NextResponse.json({ error: error.message || "Failed to send email." }, { status: 500 });
  }
}
