
import { NextResponse } from "next/server";
import * as Brevo from "@getbrevo/brevo";

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
    
    const apiInstance = new Brevo.TransactionalEmailsApi();
    apiInstance.setApiKey(Brevo.TransactionalEmailsApiApiKeys.apiKey, BREVO_API_KEY);
    
    const sendSmtpEmail = new Brevo.SendSmtpEmail();
    sendSmtpEmail.sender = { email: "no-reply@pecusintermediate.com", name: "PECU'S INTERMEDIATE" };
    sendSmtpEmail.to = [{ email: to_email, name: to_name || 'Usuário' }];
    sendSmtpEmail.subject = subject;
    sendSmtpEmail.htmlContent = html_content;

    const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
    
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error("Brevo API Error:", error);
    return NextResponse.json({ error: error.message || "Failed to send email." }, { status: 500 });
  }
}
