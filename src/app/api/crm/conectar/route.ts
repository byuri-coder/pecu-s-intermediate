
export const runtime = "nodejs"; // GARANTE QUE XLSX VAI FUNCIONAR
export const dynamic = "force-dynamic";

// 🔥 CRÍTICO NA RENDER
export const maxDuration = 60; 
export const maxBodySize = "15mb";

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { CrmIntegration } from "@/models/CrmIntegration";
import { Anuncio } from "@/models/Anuncio";
import * as xlsx from "xlsx";
import redis from "@/lib/redis";

async function parseFileFromBuffer(buffer: Buffer) {
    const workbook = xlsx.read(buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet, { defval: "" });
    return data;
}


async function publicarAtivos(data: any[], uidFirebase: string) {
    const anunciosParaPublicar = [];

    for (const row of data) {

        // NORMALIZAÇÃO DE CAMPOS
        const titulo =
            row.titulo ||
            row.Título ||
            row.nome ||
            row.Nome ||
            row.descricao ||
            row.Descrição ||
            "Sem título";

        const price =
            Number(
                row.preco ||
                row.Preço ||
                row.precoUnitario ||
                row.price ||
                row.Price ||
                0
            );

        const tipo =
            (row.tipo || row.Tipo || "other").toString().toLowerCase();

        // GARANTE QUE CATEGORIA, STATUS E UID EXISTEM
        const anuncio = {
            uidFirebase,
            titulo,
            tipo,
            price,
            metadados: { ...row },
            status: "Disponível",
            createdAt: new Date(),
        };

        anunciosParaPublicar.push(anuncio);
    }

    if (anunciosParaPublicar.length > 0) {
        await Anuncio.insertMany(anunciosParaPublicar, { ordered: false });
    }

    // LIMPA TODO O CACHE RELACIONADO
    try {
        const allKeys = await redis.keys("anuncios*");
        if (allKeys.length > 0) {
            await redis.del(allKeys);
        }
        console.log(`🧹 Cache cleared for user ${uidFirebase} and all anuncios.`);
    } catch (error) {
        console.error("Error clearing Redis cache:", error);
    }

    return anunciosParaPublicar.length;
}


export async function POST(req: Request) {
    try {
        await connectDB();
        const contentType = req.headers.get('content-type') || '';
        console.log("📥 Recebido headers:", contentType);

        if (contentType.includes('multipart/form-data')) {
            const formData = await req.formData();
            console.log("📥 formData keys:", [...formData.keys()]);
            const file = formData.get('file') as File | null;
            const userId = formData.get('userId') as string;

            if (!file || !userId) {
                console.error("❌ Arquivo ou userId não recebido no formData!");
                return NextResponse.json({ error: "Arquivo e ID do usuário são obrigatórios." }, { status: 400 });
            }
            console.log("📦 Arquivo recebido:", file.name, file.size);
            
            if (file instanceof Blob) {
                 const buffer = Buffer.from(await file.arrayBuffer());
                 const rawData = await parseFileFromBuffer(buffer);

                if (!rawData || rawData.length === 0) {
                    return NextResponse.json({ error: "Arquivo inválido ou vazio." }, { status: 400 });
                }

                const total = await publicarAtivos(rawData, userId);

                await CrmIntegration.updateOne(
                    { userId: userId },
                    { $set: { 
                        integrationType: 'file',
                        active: true,
                        lastSync: new Date(),
                        syncStatus: 'success',
                    } },
                    { upsert: true }
                );

                return NextResponse.json({ message: `Sucesso! ${total} ativos foram importados e publicados.`, total });
            }
            
            return NextResponse.json({ error: "Tipo de arquivo inválido" }, { status: 400 });


        } else if (contentType.includes('application/json')) {
            const { userId, crm, apiKey, accountId } = await req.json();

            if (!userId || !crm || !apiKey) {
                return NextResponse.json({ error: "Dados insuficientes para conectar o CRM via API." }, { status: 400 });
            }

            await CrmIntegration.updateOne(
                { userId: userId },
                {
                    $set: {
                        crm,
                        apiKey,
                        accountId: accountId || null,
                        active: true,
                        integrationType: 'api',
                        connectedAt: new Date(),
                    }
                },
                { upsert: true }
            );

            return NextResponse.json({ message: "CRM conectado com sucesso!" });
        } else {
             return NextResponse.json({ error: "Content-Type não suportado." }, { status: 415 });
        }

    } catch (error: any) {
        console.error("Erro ao conectar/importar CRM:", error);
        return NextResponse.json({ error: "Erro interno no servidor ao tentar processar a solicitação." }, { status: 500 });
    }
}
