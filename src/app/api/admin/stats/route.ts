// src/app/api/admin/stats/route.ts
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Usuario } from "@/models/Usuario";
import { Anuncio } from "@/models/Anuncio";
import { Contrato } from "@/models/Contrato"; // Assuming a contract model for sold/negotiating items

export async function GET(req: Request) {
  try {
    const db = await connectDB();
    if (!db) {
       return NextResponse.json({ ok: false, error: "Database not connected" }, { status: 500 });
    }
    
    // Total Revenue (simulated from sold 'anuncios')
    const soldAnuncios = await Anuncio.find({ status: 'Vendido' });
    const totalRevenue = soldAnuncios.reduce((acc, anuncio) => acc + (anuncio.price || 0), 0);

    // Active Users
    const userCount = await Usuario.countDocuments();

    // Transactions
    const transactionsCount = await Contrato.countDocuments({ status: 'assinado' });

    // Credits in Negotiation
    const negotiatingCount = await Anuncio.countDocuments({ status: 'Negociando' });

    // Recent Transactions (last 5 signed contracts)
    const recentTransactions = await Contrato.find({ status: 'assinado' })
      .populate({ path: 'anuncioId', model: Anuncio })
      .populate({ path: 'uidFirebaseBuyer', model: Usuario, select: 'nome email' })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    const formattedRecentTransactions = recentTransactions.map(tx => ({
        ...tx,
        anuncio: tx.anuncioId, // for simplicity
        buyer: tx.uidFirebaseBuyer,
        price: (tx.anuncioId as any)?.price
    }))

    return NextResponse.json({ 
        ok: true, 
        stats: {
            totalRevenue,
            userCount,
            transactionsCount,
            negotiatingCount
        },
        recentTransactions: formattedRecentTransactions
    });

  } catch (err: any) {
    console.error("Erro /api/admin/stats:", err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
