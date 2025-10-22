// src/app/api/faturas/route.ts
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Fatura } from '@/models/Fatura';
import { Usuario } from '@/models/Usuario';

export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
        return NextResponse.json({ ok: false, error: 'ID do usuário é obrigatório' }, { status: 400 });
    }

    const user = await Usuario.findOne({ uidFirebase: userId }).lean();
    if (!user) {
        return NextResponse.json({ ok: true, invoices: [] });
    }

    const invoices = await Fatura.find({ usuarioId: user._id })
      .sort({ dataVencimento: -1 })
      .lean();
    
    const formattedInvoices = invoices.map(inv => ({
        id: inv._id.toString(),
        transactionId: inv.contratoId?.toString().split('_')[1] || 'N/A',
        description: inv.description,
        dueDate: new Date(inv.dataVencimento).toLocaleDateString('pt-BR'),
        value: inv.valor,
        status: inv.status,
        rejectionReason: inv.motivoRecusa,
    }));

    return NextResponse.json({ ok: true, invoices: formattedInvoices });

  } catch (error: any) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
