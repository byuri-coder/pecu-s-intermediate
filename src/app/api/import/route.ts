
import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { parse } from "csv-parse/sync";
import pdf from "pdf-parse";
import { connectDB } from "@/lib/mongodb";
import { Anuncio } from "@/models/Anuncio";
import { AuditLog } from "@/models/AuditLog";
import { getAuth } from "firebase-admin/auth";
import { getAdminApp } from "@/firebase/server-provider";

// Sanitize keys from the uploaded file to match our database schema fields
function sanitizeKeys(obj: any) {
    const cleaned: any = {};
    for (const key of Object.keys(obj)) {
        const normalized = key
            .normalize("NFKC")
            .replace(/[\uFEFF]/g, "") // Remove BOM
            .trim()
            .toLowerCase()
            .replace(/\s+/g, "_"); // Replace spaces with underscores
        cleaned[normalized] = obj[key];
    }
    return cleaned;
}

// Convert parsed data into the Anuncio schema format
function transformToAnuncio(data: any[], userId: string) {
    return data.map(item => {
        const sanitizedItem = sanitizeKeys(item);
        return {
            uidFirebase: userId,
            titulo: sanitizedItem.titulo || sanitizedItem.nome || "Sem título",
            descricao: sanitizedItem.descricao || "",
            tipo: sanitizedItem.tipo?.toLowerCase() || "other",
            price: Number(sanitizedItem.preco || sanitizedItem.price || sanitizedItem.valor || 0),
            metadados: item, // Store original row data in metadados
            status: "Disponível",
        };
    });
}


export async function POST(req: NextRequest) {
  await connectDB();
  const adminApp = getAdminApp();
  const auth = getAuth(adminApp);
  let userId = "anonymous";
  let userEmail = "anonymous";
  
  // Basic user identification (in a real app, use a more secure token verification)
  try {
    const authorization = req.headers.get("Authorization");
    if (authorization?.startsWith("Bearer ")) {
      const idToken = authorization.substring(7);
      const decodedToken = await auth.verifyIdToken(idToken);
      userId = decodedToken.uid;
      userEmail = decodedToken.email || "unknown";
    }
  } catch (error) {
      console.warn("Could not verify user token, proceeding as anonymous.", error);
  }

  const formData = await req.formData();
  const file = formData.get("file") as File;

  try {
    if (!file) {
      throw new Error("Nenhum arquivo enviado.");
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const fileName = file.name.toLowerCase();
    let extractedData: any[] = [];

    // --- File Parsing Logic ---
    if (fileName.endsWith(".xlsx") || fileName.endsWith(".xls")) {
      const workbook = XLSX.read(buffer, { type: "buffer" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      extractedData = XLSX.utils.sheet_to_json(sheet);
    } else if (fileName.endsWith(".csv")) {
      extractedData = parse(buffer.toString('utf-8'), {
        columns: true,
        skip_empty_lines: true,
      });
    } else if (fileName.endsWith(".pdf")) {
      const pdfData = await pdf(buffer);
      extractedData = [{ text: pdfData.text }]; // Wrap text in an object for consistency
    } else {
      throw new Error("Formato de arquivo não suportado.");
    }

    if (extractedData.length === 0) {
        throw new Error("O arquivo está vazio ou não pôde ser lido.");
    }

    // --- Data Transformation and Database Insertion ---
    const anuncios = transformToAnuncio(extractedData, userId);
    const inserted = await Anuncio.insertMany(anuncios);

    // --- Audit Logging (Success) ---
    await AuditLog.create({
      userId: userId, // In a real app, you would have a user ID reference
      action: "IMPORTAÇÃO DE ARQUIVO (SUCESSO)",
      details: {
        fileName: file.name,
        fileType: file.type,
        assetCount: inserted.length,
      },
      ipAddress: req.ip,
    });

    return NextResponse.json({
      success: true,
      message: `${inserted.length} ativos importados e publicados com sucesso!`,
      count: inserted.length
    });

  } catch (err: any) {
    console.error("Erro ao importar arquivo:", err);

    // --- Audit Logging (Failure) ---
    await AuditLog.create({
      userId: userId,
      action: "IMPORTAÇÃO DE ARQUIVO (FALHA)",
      details: {
        fileName: file?.name || "N/A",
        error: err.message,
      },
      ipAddress: req.ip,
    });

    return NextResponse.json(
      { success: false, error: "Erro ao processar arquivo.", details: err.message },
      { status: 500 }
    );
  }
}
