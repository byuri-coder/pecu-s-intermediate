
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { ImportAuditLog } from "@/models/ImportAuditLog";
import { Anuncio } from "@/models/Anuncio"; // seu model de anúncios

export async function POST(req: Request) {
  const contentType = req.headers.get("content-type") || "";
  await connectDB();

  const timestamp = new Date();

  // ======================================================
  // 🟦 1) UPLOAD DE ARQUIVO (FormData)
  // ======================================================
  if (contentType.includes("multipart/form-data")) {
    try {
      const form = await req.formData();
      const file = form.get("file") as File;
      const userId = form.get("userId") as string;
      const integrationType = form.get("integrationType") as string;

      if (!file || !(file instanceof File)) {
        return NextResponse.json(
          { error: "Nenhum arquivo enviado." },
          { status: 400 }
        );
      }

      // 🔵 Conteúdo real do arquivo
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // ======================================================
      // 🔥 1.1 — PROCESSA O ARQUIVO E CONVERTE PARA "anúncios"
      // ======================================================

      let anunciosExtraidos: any[] = [];

      if (file.name.endsWith(".xlsx")) {
        const XLSX = await import("xlsx");
        const workbook = XLSX.read(buffer, { type: "buffer" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        anunciosExtraidos = XLSX.utils.sheet_to_json(sheet);
      }

      if (file.name.endsWith(".csv")) {
        const { parse } = await import("csv-parse/sync");
        anunciosExtraidos = parse(buffer.toString(), {
          columns: true,
          skip_empty_lines: true,
        });
      }

      if (file.name.endsWith(".json")) {
        anunciosExtraidos = JSON.parse(buffer.toString());
      }

      if (file.name.endsWith(".xml")) {
        const { XMLParser } = await import("fast-xml-parser");
        const parser = new XMLParser();
        const xmlData = parser.parse(buffer.toString());
        anunciosExtraidos = xmlData?.anuncios || [];
      }

      // Se não conseguiu extrair nada
      if (anunciosExtraidos.length === 0) {
        return NextResponse.json(
          { error: "Nenhum anúncio encontrado no arquivo." },
          { status: 400 }
        );
      }
      
      // ======================================================
      // 🟨 1.1.1 - SANITIZE DATA AND PROVIDE DEFAULTS
      // ======================================================
       const anunciosLimpos = anunciosExtraidos.map((a) => ({
          ...a,
          uidFirebase: userId,
          tipo: a.tipo || "other",
          titulo: a.titulo || a.nome || "Sem título",
          origin: `import:${integrationType}`,
          createdAt: timestamp,
        }));


      // ======================================================
      // 🟩 1.2 — SALVA NO MONGODB
      // ======================================================
      const anunciosSalvos = await Anuncio.insertMany(anunciosLimpos);

      // ======================================================
      // 🟥 1.3 — CRIA LOG PARA AUDITORIA
      // ======================================================
      await ImportAuditLog.create({
        userId,
        integrationType,
        originalFileName: file.name,
        totalRegistros: anunciosSalvos.length,
        createdAt: timestamp,
      });

      return NextResponse.json({
        message: "Importação concluída com sucesso",
        registrosSalvos: anunciosSalvos.length,
        userId,
      });
    } catch (err: any) {
      return NextResponse.json(
        { error: "Erro no upload: " + err.message },
        { status: 500 }
      );
    }
  }

  // ======================================================
  // 🟧 2) CONEXÃO VIA API KEY (JSON)
  // ======================================================
  if (contentType.includes("application/json")) {
    try {
      const body = await req.json();

      if (!body.crm || !body.apiKey) {
        return NextResponse.json(
          { error: "CRM e API Key são obrigatórios." },
          { status: 400 }
        );
      }

      // grava log no banco
      await ImportAuditLog.create({
        userId: body.userId,
        integrationType: "api-key",
        originalFileName: null,
        totalRegistros: 0,
        credentials: body,
        createdAt: timestamp,
      });

      return NextResponse.json({
        message: "Conectado ao CRM com API Key.",
        userId: body.userId,
      });
    } catch (err: any) {
      return NextResponse.json(
        { error: "Erro no JSON: " + err.message },
        { status: 500 }
      );
    }
  }

  return NextResponse.json(
    { error: "Formato inválido." },
    { status: 400 }
  );
}
