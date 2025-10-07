import { NextResponse } from "next/server";

export async function GET() {
  try {
    const apiKey = process.env.BREVO_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "BREVO_API_KEY não configurada." }, { status: 500 });
    }

    const response = await fetch("https://api.brevo.com/v3/account", {
      headers: {
        "accept": "application/json",
        "api-key": apiKey
      }
    });

    const data = await response.json();

    return NextResponse.json({
      success: response.ok,
      status: response.status,
      data
    });

  } catch (err: any) {
    return NextResponse.json({
      success: false,
      error: err.message
    }, { status: 500 });
  }
}
