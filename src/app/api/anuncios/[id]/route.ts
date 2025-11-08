// src/app/api/anuncios/[id]/route.ts
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Anuncio } from "@/models/Anuncio";
import mongoose from "mongoose";

// GET - Obter um anúncio específico
export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const { id } = params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ ok: false, error: "ID de anúncio inválido" }, { status: 400 });
    }

    const anuncio = await Anuncio.findById(id).lean();

    if (!anuncio || anuncio.status === 'Deletado') {
      return NextResponse.json({ ok: false, error: "Anúncio não encontrado" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, anuncio });
  } catch (err: any) {
    console.error(`Erro /api/anuncios/${params.id} (GET):`, err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}

// PUT - Atualizar um anúncio existente
export async function PUT(req: Request, { params }: { params: { id: string } }) {
    await connectDB();
    const { id } = params;
    const body = await req.json();

    try {
        const updated = await Anuncio.findByIdAndUpdate(id, body, { new: true });
        if (!updated) return NextResponse.json({ error: "Ativo não encontrado" }, { status: 404 });
        return NextResponse.json({ message: "Ativo atualizado com sucesso", data: updated });
    } catch (err: any) {
        console.error(`Erro /api/anuncios/${id} (PUT):`, err);
        return NextResponse.json({ error: "Erro ao atualizar ativo" }, { status: 500 });
    }
}


// PATCH - Atualizar parcialmente (ex: status)
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
    await connectDB();
    const { id } = params;
    const { status } = await req.json();

    try {
        const asset = await Anuncio.findById(id);
        if (!asset) return NextResponse.json({ error: "Ativo não encontrado" }, { status: 404 });

        if (status) {
            asset.status = status;
        }

        await asset.save();
        return NextResponse.json({ message: "Status atualizado com sucesso", data: asset });
    } catch (err: any) {
        console.error(`Erro /api/anuncios/${id} (PATCH):`, err);
        return NextResponse.json({ error: "Erro ao atualizar status" }, { status: 500 });
    }
}

// DELETE - Marcar como excluído (soft delete)
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    await connectDB();
    const { id } = params;

    try {
        const asset = await Anuncio.findById(id);

        if (!asset) {
            return NextResponse.json({ error: "Ativo não encontrado" }, { status: 404 });
        }
        
        if (asset.status === 'Vendido') {
             return NextResponse.json({ error: "Anúncios vendidos não podem ser excluídos." }, { status: 400 });
        }
        
        asset.status = 'Deletado';
        asset.deletedAt = new Date();
        await asset.save();
        
        return NextResponse.json({ message: "Ativo excluído com sucesso" });
    } catch (err: any) {
        console.error(`Erro /api/anuncios/${id} (DELETE):`, err);
        return NextResponse.json({ error: "Erro ao excluir ativo" }, { status: 500 });
    }
}
