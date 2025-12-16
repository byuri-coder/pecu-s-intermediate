
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

// Universal number parser to handle various formats from XLSX files
function parseAnyNumber(value: any): number {
  if (value === null || value === undefined) return 0;

  let str = String(value)
    .toLowerCase()
    .normalize("NFD")               // remove acentos
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/r\$/g, "")
    .replace(/reais?/g, "")
    .replace(/ha|hectares?/g, "")
    .replace(/m2|metros?/g, "")
    .replace(/[^0-9.,-]/g, "")      // remove tudo que não for número
    .replace(/\.(?=.*\.)/g, "")     // remove separador de milhar
    .replace(/,/g, ".");

  const num = Number(str);
  return Number.isFinite(num) ? num : 0;
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
            sanitized.nome ||
            sanitized.nome_do_imovel ||
            "Imóvel Rural",

        tipo:
            sanitized.tipo ||
            sanitized.tipo_de_ativo ||
            defaultAssetType ||
            "rural-land",

        price: parseAnyNumber(
            sanitized.preco ||
            sanitized.preco_r$ ||
            sanitized.valor ||
            sanitized.valor_total
        ),
        
        metadados: {
            ...raw,
            areaHectares: parseAnyNumber(
              sanitized.area_hectares ||
              sanitized.area_ha ||
              sanitized.area ||
              sanitized.tamanho ||
              sanitized.hectares
            ),
        },

        status: "Disponível",
        origin: `import:${integrationType}`,
        createdAt: timestamp,
    };
}

function parseSingleAdFromXLSX(buffer: Buffer) {
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: false, dateNF: "yyyy-mm-dd" });

  const ad: any = {};

  for (const row of rows) {
    if (!row[0] || row[1] === null || row[1] === undefined) continue;

    const key = removeAccents(String(row[0])).trim().toLowerCase().replace(/\s+/g, "_");
    const value = row[1];

    ad[key] = value;
  }

  return ad;
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
      let savedCount = 0;

      for (const file of files) {
        if (!(file instanceof Blob)) {
            console.warn("Item inválido ignorado:", file);
            continue;
        }
        const buffer = Buffer.from(await file.arrayBuffer());
        const name = file.name.toLowerCase();

        if (name.endsWith(".xlsx")) {
            const adObject = parseSingleAdFromXLSX(buffer);
            
            const anuncioToCreate = {
              uidFirebase: userId,
              titulo: adObject["titulo"] || "Sem título",
              tipo: adObject["tipo_transacao"] === "venda" ? "rural-land" : (adObject["tipo_transacao"] || defaultAssetType || "other"),
              price: parseAnyNumber(adObject["valor_reais"]),
              status: "Disponível",
              origin: `import:${integrationType}`,
              createdAt: timestamp,
              metadados: {
                ...adObject,
                owner: adObject["dono"],
                registration: adObject["numero_propriedade"],
                location: `${adObject["municipio"]}, ${adObject["estado"]}`,
                sizeHa: parseAnyNumber(adObject["tamanho_hectares"]),
                businessType: adObject["tipo_transacao"] || 'Venda',
              },
              descricao: adObject["descricao"]
            };
            await Anuncio.create(anuncioToCreate);
            savedCount++;

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
             // For non-xlsx files, use the multi-record logic
            if (rows.length > 0) {
                const normalized = rows.map((raw) => {
                    const sanitized: { [key: string]: any } = {};
                    for (const key of Object.keys(raw)) {
                        const k = removeAccents(key).trim().toLowerCase().replace(/\s+/g, "_");
                        sanitized[k] = raw[key];
                    }

                    console.log("IMPORT CHECK", {
                        preco_raw: sanitized.preco,
                        area_raw: sanitized.area_hectares,
                        preco_final: parseAnyNumber(sanitized.preco),
                        area_final: parseAnyNumber(sanitized.area_hectares),
                    });

                    return normalizeAndMapRecord(raw, userId, integrationType, timestamp, defaultAssetType);
                });
                const saved = await Anuncio.insertMany(normalized);
                savedCount += saved.length;
            }
        }
      }
      
      if (savedCount === 0) {
         return NextResponse.json(
          { error: "Nenhum registro válido encontrado nos arquivos." },
          { status: 400 }
        );
      }

      await clearCachePrefix("anuncios");

      await ImportAuditLog.create({
        userId,
        integrationType,
        originalFileName: files.map((f) => f.name).join(", "),
        totalRegistros: savedCount,
        createdAt: timestamp,
      });

      return NextResponse.json({
        message: "Importação concluída",
        registrosSalvos: savedCount,
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
