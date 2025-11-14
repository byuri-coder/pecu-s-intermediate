
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { CrmIntegration } from "@/models/CrmIntegration";

export async function POST(req: Request) {
    try {
        await connectDB();
        const { userId, crm, apiKey, accountId } = await req.json();

        if (!userId || !crm || !apiKey) {
            return NextResponse.json({ error: "Dados insuficientes para conectar o CRM." }, { status: 400 });
        }

        // Use 'upsert' to either update the existing record or create a new one
        await CrmIntegration.updateOne(
            { userId: userId },
            {
                $set: {
                    crm,
                    apiKey, // IMPORTANT: In a real app, this should be encrypted
                    accountId: accountId || null,
                    active: true,
                    connectedAt: new Date(),
                }
            },
            { upsert: true }
        );

        return NextResponse.json({ message: "CRM conectado com sucesso!" });

    } catch (error: any) {
        console.error("Erro ao conectar CRM:", error);
        return NextResponse.json({ error: "Erro interno no servidor ao tentar conectar o CRM." }, { status: 500 });
    }
}
