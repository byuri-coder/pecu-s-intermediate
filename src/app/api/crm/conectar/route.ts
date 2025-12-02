
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { ImportAuditLog } from "@/models/ImportAuditLog";
import { Anuncio } from "@/models/Anuncio"; // seu model de anúncios
import redis from "@/lib/redis";
import * as XLSX from "xlsx";
import { parse } from "csv-parse/sync";
import { XMLParser } from "fast-xml-parser";

async function clearCachePrefix(prefix: string) {
  try {
    const keys = await redis.keys(`${prefix}:*`);
    if (keys.length > 0) {
      await redis.del(keys);
      console.log(`🧹 Cache cleared: ${keys.length} keys removed for prefix '${prefix}:'`);
    }
  } catch (error) {
    console.error("Error clearing Redis cache:", error);
  }
}

function normalizeAndMapRecord(raw: any, userId: string, integrationType: string, timestamp: Date) {
    const sanitized: { [key: string]: any } = {};
    for (const key of Object.keys(raw)) {
        const normalizedKey = key.trim().toLowerCase().replace(/\s+/g, '_');
        sanitized[normalizedKey] = raw[key];
    }
    
    return {
        uidFirebase: userId,
        titulo: sanitized.titulo || sanitized.nome_do_ativo || sanitized.asset_name || "Sem título",
        tipo: sanitized.tipo || sanitized.categoria || sanitized.category || "other",
        price: Number(sanitized.preco || sanitized.price || sanitized.valor || sanitized.valor_reais || 0),
        status: "Disponível", // Definindo um status padrão para exibição
        origin: `import:${integrationType}`,
        createdAt: timestamp,
        metadados: raw, // Mantém os dados originais para referência
    };
}


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
      const fileName = file.name.toLowerCase();

      if (fileName.endsWith(".xlsx")) {
        const workbook = XLSX.read(buffer, { type: "buffer" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        anunciosExtraidos = XLSX.utils.sheet_to_json(sheet);
      } else if (fileName.endsWith(".csv")) {
        anunciosExtraidos = parse(buffer.toString('utf-8'), {
          columns: true,
          skip_empty_lines: true,
          delimiter: [',', ';'] // Suporta ambos os delimitadores
        });
      } else if (fileName.endsWith(".json")) {
        anunciosExtraidos = JSON.parse(buffer.toString());
      } else if (fileName.endsWith(".xml")) {
        const parser = new XMLParser();
        const xmlData = parser.parse(buffer.toString());
        anunciosExtraidos = xmlData?.anuncios?.anuncio || xmlData?.anuncios || [];
      }


      // Se não conseguiu extrair nada
      if (anunciosExtraidos.length === 0) {
        return NextResponse.json(
          { error: "Nenhum anúncio encontrado no arquivo." },
          { status: 400 }
        );
      }
      
      // ======================================================
      // 🟨 1.1.1 - NORMALIZE E MAPEI OS DADOS
      // ======================================================
       const anunciosLimpos = anunciosExtraidos.map(raw => normalizeAndMapRecord(raw, userId, integrationType, timestamp));


      // ======================================================
      // 🟩 1.2 — SALVA NO MONGODB
      // ======================================================
      const anunciosSalvos = await Anuncio.insertMany(anunciosLimpos);
      
      // ======================================================
      // 🧹 1.2.1 - LIMPA O CACHE DO REDIS
      // ======================================================
      await clearCachePrefix("anuncios");


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
