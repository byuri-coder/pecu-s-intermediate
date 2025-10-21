// src/app/api/anuncios/get/[id]/route.ts
import { NextResponse } from "next/server";
import { connectDB, DISABLE_MONGO } from "@/lib/mongodb";
import { Anuncio } from "@/models/Anuncio";
import mongoose from "mongoose";
import { placeholderCredits, placeholderRuralLands, placeholderTaxCredits } from "@/lib/placeholder-data";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const db = await connectDB();
    if (DISABLE_MONGO) {
       console.log("📄 Usando dados mockados (sem MongoDB)");
       const mockData = [...placeholderCredits, ...placeholderRuralLands, ...placeholderTaxCredits];
       const foundMock = mockData.find(item => item.id === params.id);
       
       if (foundMock) {
            // A API real retorna um objeto "anuncio", então vamos simular isso.
            const assetTypeMap: { [key: string]: 'carbon-credit' | 'tax-credit' | 'rural-land' } = {
                'credit-001': 'carbon-credit',
                'tax-001': 'tax-credit',
                'land-001': 'rural-land',
            };
            const tipo = assetTypeMap[foundMock.id] || 'other';

            const mockAnuncio = {
                _id: foundMock.id,
                titulo: 'title' in foundMock ? foundMock.title : `Crédito de ${'taxType' in foundMock ? foundMock.taxType : 'N/A'}`,
                tipo: tipo,
                price: 'price' in foundMock ? foundMock.price : ('pricePerCredit' in foundMock ? foundMock.pricePerCredit : 0),
                descricao: 'projectOverview' in foundMock ? foundMock.projectOverview : ('description' in foundMock ? foundMock.description : ''),
                uidFirebase: foundMock.ownerId,
                status: foundMock.status,
                metadados: {
                    ...foundMock
                }
            };
            return NextResponse.json({ ok: true, anuncio: mockAnuncio });
       }
       return NextResponse.json({ ok: false, error: "Anúncio mockado não encontrado" }, { status: 404 });
    }

    const { id } = params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return NextResponse.json({ ok: false, error: "ID de anúncio inválido" }, { status: 400 });
    }

    const anuncio = await Anuncio.findById(id).lean();

    if (!anuncio) {
      return NextResponse.json({ ok: false, error: "Anúncio não encontrado" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, anuncio });
  } catch (err: any) {
    console.error(`Erro /api/anuncios/get/${params.id}:`, err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
