
// src/app/api/chat/create/route.ts
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { ChatRoom } from '@/models/ChatRoom';
import { Anuncio } from '@/models/Anuncio';

export async function POST(req: Request) {
  try {
    await connectDB();
    const { buyerId, assetId } = await req.json();

    if (!buyerId || !assetId) {
      return NextResponse.json({ ok: false, error: 'Dados obrigatórios ausentes (buyerId, assetId)' }, { status: 400 });
    }

    // Find the asset to get the sellerId
    const asset = await Anuncio.findById(assetId).lean();
    if (!asset) {
        return NextResponse.json({ ok: false, error: 'Ativo não encontrado' }, { status: 404 });
    }
    const sellerId = asset.uidFirebase;

    // This logic prevents creating a chat where the buyer is also the seller
    if (buyerId === sellerId) {
      return NextResponse.json({ ok: false, error: 'O comprador não pode iniciar um chat consigo mesmo.' }, { status: 400 });
    }

    // Find existing chat or create a new one
    let chatRoom = await ChatRoom.findOne({ buyerId, sellerId, assetId });

    if (!chatRoom) {
      chatRoom = await ChatRoom.create({ buyerId, sellerId, assetId });
    }
    
    // The chatId is the MongoDB document _id
    return NextResponse.json({ ok: true, chatId: chatRoom._id.toString() });

  } catch (error: any) {
    console.error('Erro em /api/chat/create:', error);
    // Handle potential unique index violation if two requests come in at the same time
    if (error.code === 11000) {
        let chatRoom = await ChatRoom.findOne({ 
            buyerId: (await req.json()).buyerId, 
            sellerId: (await Anuncio.findById((await req.json()).assetId).lean())?.uidFirebase, 
            assetId: (await req.json()).assetId 
        });
        return NextResponse.json({ ok: true, chatId: chatRoom?._id.toString() });
    }
    return NextResponse.json({ ok: false, error: 'Erro interno do servidor' }, { status: 500 });
  }
}
