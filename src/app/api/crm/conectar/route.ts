
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { CrmIntegration } from "@/models/CrmIntegration";
import { Anuncio } from "@/models/Anuncio";
import xlsx from "xlsx";
import redis from "@/lib/redis";

async function parseFileFromBuffer(buffer: Buffer) {
    const workbook = xlsx.read(buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet, { defval: "" });
    return data;
}

async function publicarAtivos(data: any[], uidFirebase: string) {
    const anuncios = data.map(row => ({
        uidFirebase,
        titulo: (row as any).titulo || (row as any).nome || "Sem título",
        tipo: (row as any).tipo?.toLowerCase() || "other",
        price: Number((row as any).preco || (row as any).price || 0),
        metadados: {
            ...row
        },
        status: 'Disponível',
        createdAt: new Date(),
    }));

    if (anuncios.length > 0) {
        await Anuncio.insertMany(anuncios);
    }
    
    // Clear relevant caches
    await redis.del(`anuncios:${uidFirebase}`);
    await redis.del("anuncios"); // General cache key for public listings

    return anuncios.length;
}


export async function POST(req: Request) {
    try {
        await connectDB();
        const contentType = req.headers.get('content-type') || '';

        if (contentType.includes('multipart/form-data')) {
            const formData = await req.formData();
            const file = formData.get('file') as File;
            const userId = formData.get('userId') as string;

            if (!file || !userId) {
                return NextResponse.json({ error: "Arquivo e ID do usuário são obrigatórios." }, { status: 400 });
            }

            // Process the file
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
