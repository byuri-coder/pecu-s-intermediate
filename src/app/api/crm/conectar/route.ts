
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

// CAMADA 1 — Normalização agressiva de texto
function normalizeText(input: any): string {
  return String(input ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove acentos
    .replace(/\s+/g, " ")
    .trim();
}

const AREA_KEYS = ["area", "tamanho", "hectares", "extensao", "metragem", "m2", "km2"];
const PRECO_KEYS = ["preco", "valor", "venda", "r$", "reais"];

function parseFlexibleNumber(value: any): number | null {
  if (value === null || value === undefined) return null;

  let str = String(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/r\$/g, "")
    .replace(/reais?/g, "")
    .replace(/[^0-9.,]/g, "");

  if (!str) return null;

  // Caso: 1.234,56
  if (str.includes(".") && str.includes(",")) {
    str = str.replace(/\./g, "").replace(",", ".");
  }
  // Caso: 1.234
  else if (str.includes(".") && !str.includes(",")) {
    const parts = str.split(".");
    if (parts[1]?.length === 3) {
      str = parts.join("");
    }
  }
  // Caso: 1,234
  else if (str.includes(",") && !str.includes(".")) {
    const parts = str.split(",");
    if (parts[1]?.length === 3) {
      str = parts.join("");
    } else {
      str = parts.join(".");
    }
  }

  const num = Number(str);
  return Number.isFinite(num) ? num : null;
}


// CAMADA 4 — Leitura por chave + fallback por valor textual
function extractFields(record: Record<string, any>) {
  let preco: number | null = null;
  let area: number | null = null;

  for (const [rawKey, rawValue] of Object.entries(record)) {
    const key = normalizeText(rawKey);
    const value = normalizeText(rawValue);

    // PREÇO
    if (preco === null && PRECO_KEYS.some(k => key.includes(k))) {
      preco = parseFlexibleNumber(rawValue);
    }

    // ÁREA
    if (area === null && AREA_KEYS.some(k => key.includes(k))) {
      let num = parseFlexibleNumber(rawValue);

      // Conversões automáticas
      if (value.includes("m2")) num = num ? num / 10000 : num;
      if (value.includes("km2")) num = num ? num * 100 : num;

      area = num;
    }
  }

  return {
    preco,
    area_hectares: area,
  };
}


function normalizeAndMapRecord(raw: any, userId: string, integrationType: string, timestamp: Date, defaultAssetType?: string) {
    const sanitized: { [key: string]: any } = {};
    for (const key of Object.keys(raw)) {
        const k = normalizeText(key);
        sanitized[k] = raw[key];
    }
    
    const { preco, area_hectares } = extractFields(raw);

    return {
        uidFirebase: userId,
        titulo: sanitized["titulo"] || sanitized["nome"] || sanitized["nome do imovel"] || "Imóvel Rural",
        tipo: sanitized["tipo"] || sanitized["tipo de ativo"] || defaultAssetType || "terras_rurais",
        price: preco,
        metadados: {
            ...raw,
            areaHectares: area_hectares,
        },
        status: "Disponível",
        origin: `import:${integrationType}`,
        createdAt: timestamp,
    };
}


function parseVerticalSheet(rows: any[][]) {
  const obj: Record<string, any> = {};

  for (let i = 0; i < rows.length; i++) {
    const [key, value] = rows[i];
    if (!key) continue;
    
    const normalizedKey = removeAccents(String(key))
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "_")
      .replace(/[^\w_]/g, "");

    obj[normalizedKey] = value;
  }

  return obj;
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

        if (name.endsWith(".xlsx")) {
            const wb = XLSX.read(buffer);
            const sheet = wb.Sheets[wb.SheetNames[0]];

            const matrix = XLSX.utils.sheet_to_json(sheet, {
              header: 1,
              raw: false,
              defval: null
            });
          
            const record = parseVerticalSheet(matrix);
            allRecords.push(record);

        } else {
            let rows: any[] = [];
            if (name.endsWith(".csv")) {
              rows = parse(buffer.toString("utf-8"), {
                columns: true,
                skip_empty_lines: true,
                delimiter: [",", ";"],
              });
            } else if (name.endsWith(".json")) {
              rows = JSON.parse(buffer.toString());
            } else if (name.endsWith(".xml")) {
              const parser = new XMLParser();
              const xml = parser.parse(buffer.toString());
              rows = xml?.anuncios?.anuncio || xml?.anuncios || [];
            }
             allRecords.push(...rows);
        }
      }
      
      if (allRecords.length === 0) {
         return NextResponse.json(
          { error: "Nenhum registro válido encontrado nos arquivos." },
          { status: 400 }
        );
      }
      
      const normalized = allRecords.map(raw => normalizeAndMapRecord(raw, userId, integrationType, timestamp, defaultAssetType));
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
