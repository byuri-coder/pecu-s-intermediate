
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { ImportAuditLog } from "@/models/ImportAuditLog";
import { Anuncio } from "@/models/Anuncio"; // seu model de anúncios
import redis from "@/lib/redis";
import * as XLSX from "xlsx";
import { parse } from "csv-parse/sync";
import { XMLParser } from "fast-xml-parser";
import removeAccents from "remove-accents";

export const runtime = 'nodejs';
export const dynamic = "force-dynamic"; 
export const fetchCache = "force-no-store";

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

function normalizePrice(value: any): number {
  if (!value) return 0;

  return Number(
    String(value)
      .replace(/\s+/g, "")      // remove all whitespace
      .replace(/R\$/gi, "")    // remove currency symbol
      .replace(/\./g, "")       // remove thousand separators
      .replace(/,/g, ".")       // replace decimal comma with a dot
  ) || 0;
}

function normalizeAndMapRecord(raw: any, userId: string, integrationType: string, timestamp: Date, defaultAssetType?: string) {
  const sanitized: { [key: string]: any } = {};

  for (const key of Object.keys(raw)) {
    const k = removeAccents(key)
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "_");

    sanitized[k] = raw[key];
  }
    
    return {
        uidFirebase: userId,
        titulo:
            sanitized.titulo ||
            sanitized.titulo_do_ativo ||
            sanitized.nome ||
            sanitized.nome_do_ativo ||
            "Sem título",

        tipo:
            sanitized.tipo ||
            sanitized.categoria ||
            sanitized.category ||
            defaultAssetType || // Use the default type from the form
            "other", // Final fallback

        price: normalizePrice(
            sanitized.preco ||
            sanitized.price ||
            sanitized.valor ||
            sanitized.valor_reais
        ),
        status: "Disponível",
        origin: `import:${integrationType}`,
        createdAt: timestamp,
        metadados: raw,
    };
}


export async function POST(req: Request) {
  await connectDB();
  const timestamp = new Date();
  
  const contentType = req.headers.get("content-type") || "";

  // ======================================================
  // 1) FORM-DATA — UPLOAD DE ARQUIVO
  // ======================================================
  if (contentType.includes("multipart/form-data")) {
    try {
      const form = await req.formData();
      const files = form.getAll("file") as File[];
      const userId = form.get("userId") as string;
      const integrationType = form.get("integrationType") as string;
      const defaultAssetType = form.get("defaultAssetType") as string;

      if (!files || files.length === 0) {
        return NextResponse.json(
          { error: "Nenhum arquivo válido enviado." },
          { status: 400 }
        );
      }

      let allRecords: any[] = [];

      for (const file of files) {
        if (!(file instanceof Blob)) {
            console.warn("Item inválido ignorado:", file);
            continue;
        }
        const buffer = Buffer.from(await file.arrayBuffer());
        const name = file.name.toLowerCase();

        let rows: any[] = [];

        if (name.endsWith(".csv")) {
          rows = parse(buffer.toString("utf-8"), {
            columns: true,
            skip_empty_lines: true,
            delimiter: [",", ";"],
          });
        } else if (name.endsWith(".xlsx")) {
          const wb = XLSX.read(buffer);
          const sheet = wb.Sheets[wb.SheetNames[0]];
          rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });
        } else if (name.endsWith(".json")) {
          rows = JSON.parse(buffer.toString());
        } else if (name.endsWith(".xml")) {
          const parser = new XMLParser();
          const xml = parser.parse(buffer.toString());
          rows = xml?.anuncios?.anuncio || xml?.anuncios || [];
        }

        allRecords.push(...rows);
      }
      
      if (allRecords.length === 0) {
        return NextResponse.json(
          { error: "Nenhum registro encontrado nos arquivos." },
          { status: 400 }
        );
      }

      const normalized = allRecords.map((r) =>
        normalizeAndMapRecord(r, userId, integrationType, timestamp, defaultAssetType)
      );

      const saved = await Anuncio.insertMany(normalized);

      await clearCachePrefix("anuncios");

      await ImportAuditLog.create({
        userId,
        integrationType,
        originalFileName: files.map((f) => f.name).join(", "),
        totalRegistros: saved.length,
        createdAt: timestamp,
      });

      return NextResponse.json({
        message: "Importação concluída",
        registrosSalvos: saved.length,
        userId,
      });

    } catch (err: any) {
      return NextResponse.json({ error: "Erro ao processar upload: " + err.message }, { status: 500 });
    }
  }

  // ======================================================
  // 2) JSON — API KEY
  // ======================================================
  if (contentType.includes("application/json")) {
    try {
      const body = await req.json();
      if (!body.crm || !body.apiKey) {
        return NextResponse.json({ error: "CRM e API Key são obrigatórios." }, { status: 400 });
      }

      await ImportAuditLog.create({
        userId: body.userId,
        integrationType: "api-key",
        createdAt: timestamp,
        credentials: body,
      });

      return NextResponse.json({ message: "CRM conectado com sucesso" });
    } catch (err: any) {
      return NextResponse.json({ error: "Erro ao processar JSON: " + err.message }, { status: 500 });
    }
  }

  return NextResponse.json({ error: "Formato inválido" }, { status: 400 });
}
