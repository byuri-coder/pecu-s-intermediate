
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Contrato } from '@/models/Contrato';
import { Anuncio } from '@/models/Anuncio';

export async function GET(req: Request) {
    try {
        await connectDB();

        // 1. Fetch all completed contracts and populate the related asset.
        const completedContracts = await Contrato.find({ status: 'completed' })
            .populate({ path: 'anuncioId', model: Anuncio, select: 'price tipo' })
            .lean();

        // 2. Aggregate data by month.
        const monthlyData: { [key: string]: { total: number, byType: { [key: string]: number } } } = {};

        for (const contract of completedContracts) {
            if (!contract.completedAt || !contract.anuncioId) continue;

            const date = new Date(contract.completedAt);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            const value = (contract.anuncioId as any)?.price || 0;
            const type = (contract.anuncioId as any)?.tipo || 'other';

            if (!monthlyData[monthKey]) {
                monthlyData[monthKey] = { total: 0, byType: {} };
            }

            monthlyData[monthKey].total += value;
            if (!monthlyData[monthKey].byType[type]) {
                monthlyData[monthKey].byType[type] = 0;
            }
            monthlyData[monthKey].byType[type] += value;
        }

        // 3. Format for the chart.
        const movements = Object.entries(monthlyData)
            .map(([month, data]) => ({ month, ...data }))
            .sort((a, b) => a.month.localeCompare(b.month)); // Sort chronologically

        return NextResponse.json({ ok: true, movements });

    } catch (error: any) {
        console.error("Error fetching movements data:", error);
        return NextResponse.json({ ok: false, error: "Failed to fetch movements data." }, { status: 500 });
    }
}
