
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const contentType = req.headers.get("content-type") || "";

  // 🟦 Se for upload de arquivo (FormData)
  if (contentType.includes("multipart/form-data")) {
    try {
      const form = await req.formData();
      const file = form.get("file");
      const userId = form.get("userId");
      const integrationType = form.get("integrationType");

      if (!file || !(file instanceof File)) {
        return NextResponse.json(
          { error: "Nenhum arquivo selecionado" },
          { status: 400 }
        );
      }

      // Lê o conteúdo real do arquivo
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Aqui você processa o arquivo (xlsx, csv, json, xml)
      // depois salva no MongoDB, cria logs etc.

      return NextResponse.json({
        message: `Arquivo ${file.name} importado com sucesso!`,
        originalName: file.name,
        integrationType,
        userId,
      });
    } catch (err: any) {
      return NextResponse.json(
        { error: "Erro ao processar upload: " + err.message },
        { status: 500 }
      );
    }
  }

  // 🟩 Caso seja JSON (API KEY)
  if (contentType.includes("application/json")) {
    try {
      const body = await req.json();

      if (!body.crm || !body.apiKey) {
        return NextResponse.json(
          { error: "CRM e API Key são obrigatórios." },
          { status: 400 }
        );
      }

      return NextResponse.json({
        message: "CRM conectado com sucesso via API Key.",
        crm: body.crm,
        userId: body.userId,
      });
    } catch (err: any) {
      return NextResponse.json(
        { error: "Erro ao processar JSON: " + err.message },
        { status: 500 }
      );
    }
  }

  return NextResponse.json(
    { error: "Formato de requisição inválido." },
    { status: 400 }
  );
}
