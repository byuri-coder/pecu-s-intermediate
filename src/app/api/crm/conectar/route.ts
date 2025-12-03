
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { ImportAuditLog } from "@/models/ImportAuditLog";
import { Anuncio } from "@/models/Anuncio"; // seu model de anúncios
import redis from "@/lib/redis";
import * as XLSX from "xlsx";
import { parse } from "csv-parse/sync";
import { XMLParser } from "fast-xml-parser";

export const runtime = 'nodejs'; // Force Node.js runtime for file uploads

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
        price: normalizePrice(sanitized.preco || sanitized.price || sanitized.valor || sanitized.valor_reais),
        status: "Disponível", // Definindo um status padrão para exibição
        origin: `import:${integrationType}`,
        createdAt: timestamp,
        metadados: raw, // Mantém os dados originais para referência
    };
}


export async function POST(req: Request) {
  await connectDB();
  const timestamp = new Date();
  
  // Use a try-catch block to gracefully handle parsing FormData
  const form = await req.formData().catch(() => null);

  // ======================================================
  // 🟦 1) UPLOAD DE ARQUIVO (FormData)
  // ======================================================
  if (form) {
    try {
        const file = form.get("file") as File;
        const userId = form.get("userId") as string;
        const integrationType = form.get("integrationType") as string;

        if (!file || typeof file === "string" || !file.name) {
            return NextResponse.json({ error: "Nenhum arquivo válido enviado." }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        
        let anunciosExtraidos: any[] = [];
        const fileName = file.name.toLowerCase();

        if (fileName.endsWith(".xlsx")) {
            const workbook = XLSX.read(buffer, { type: "buffer" });
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            anunciosExtraidos = XLSX.utils.sheet_to_json(sheet, {
                defval: "",
                raw: false,
                blankrows: false
            });
        } else if (fileName.endsWith(".csv")) {
            anunciosExtraidos = parse(buffer.toString('utf-8'), {
            columns: true,
            skip_empty_lines: true,
            delimiter: [',', ';']
            });
        } else if (fileName.endsWith(".json")) {
            anunciosExtraidos = JSON.parse(buffer.toString());
        } else if (fileName.endsWith(".xml")) {
            const parser = new XMLParser();
            const xmlData = parser.parse(buffer.toString());
            anunciosExtraidos = xmlData?.anuncios?.anuncio || xmlData?.anuncios || [];
        } else {
            return NextResponse.json({ error: "Formato de arquivo não suportado." }, { status: 400 });
        }
        
        if (anunciosExtraidos.length === 0) {
            return NextResponse.json({ error: "Nenhum anúncio encontrado no arquivo." }, { status: 400 });
        }

        const anunciosLimpos = anunciosExtraidos.map(raw => normalizeAndMapRecord(raw, userId, integrationType, timestamp));
        const anunciosSalvos = await Anuncio.insertMany(anunciosLimpos);
        
        await clearCachePrefix("anuncios");

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
      console.error("Erro em /api/crm/conectar (FormData):", err);
      return NextResponse.json({ error: "Erro interno no servidor: " + err.message }, { status: 500 });
    }
  }

  // ======================================================
  // 🟧 2) CONEXÃO VIA API KEY (JSON)
  // ======================================================
  try {
      const body = await req.json();
      if (body) {
          if (!body.crm || !body.apiKey) {
              return NextResponse.json({ error: "CRM e API Key são obrigatórios." }, { status: 400 });
          }
          
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
      }
  } catch (e) {
      // This error is expected if the body is not JSON, so we can ignore it if form processing was successful.
      // If we are here, it means neither FormData nor JSON was valid.
  }

  return NextResponse.json({ error: "Formato de requisição inválido." }, { status: 400 });
}
