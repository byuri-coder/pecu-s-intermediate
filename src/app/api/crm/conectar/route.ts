
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { CrmIntegration } from "@/models/CrmIntegration";
import { Readable } from 'stream';

// Helper to convert stream to buffer
async function streamToBuffer(stream: ReadableStream<Uint8Array>): Promise<Buffer> {
    const reader = stream.getReader();
    const chunks: Uint8Array[] = [];
    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
    }
    return Buffer.concat(chunks);
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

            // In a real implementation, this is where you'd call your universal parser.
            // For now, we just acknowledge the upload.
            // const buffer = await streamToBuffer(file.stream());
            // const rawData = await parseFile(buffer, file.name); -> Your universal parser
            // const cleanData = normalizeData(rawData);
            // await saveToDatabase(cleanData, userId);
            
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

            return NextResponse.json({ message: "Arquivo recebido e importação agendada!" });

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
                        apiKey, // IMPORTANT: In a real app, this should be encrypted
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
        console.error("Erro ao conectar CRM:", error);
        return NextResponse.json({ error: "Erro interno no servidor ao tentar conectar o CRM." }, { status: 500 });
    }
}
