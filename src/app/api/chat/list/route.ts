
// src/app/api/chat/list/route.ts
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { ChatRoom } from '@/models/ChatRoom';
import { Anuncio } from '@/models/Anuncio';
import { Usuario } from '@/models/Usuario';
import { Mensagem } from '@/models/Mensagem';
import mongoose from 'mongoose';
import type { Conversation } from '@/lib/types';


async function getLatestMessage(chatId: string) {
    const lastMessage = await Mensagem.findOne({ chatId }).sort({ createdAt: -1 }).lean();
    if (!lastMessage) {
        return {
            text: "Negociação iniciada...",
            timestamp: new Date(),
        }
    }
    
    let content = '...';
    if(lastMessage.type === 'text') content = lastMessage.text || '...';
    if(lastMessage.type === 'image') content = '📷 Imagem';
    if(lastMessage.type === 'pdf') content = '📄 Documento';
    if(lastMessage.type === 'location') content = '📍 Localização';
    
    return {
        text: content,
        timestamp: lastMessage.createdAt,
    }
}

export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ ok: false, error: 'ID do usuário é obrigatório' }, { status: 400 });
    }

    const chatRooms = await ChatRoom.find({
      $or: [{ buyerId: userId }, { sellerId: userId }],
    }).sort({ updatedAt: -1 }).lean();


    const conversations: Conversation[] = await Promise.all(
        chatRooms.map(async (room) => {
            const otherUserId = room.sellerId === userId ? room.buyerId : room.sellerId;
            
            const [otherUser, asset, lastMessage] = await Promise.all([
                Usuario.findOne({ uidFirebase: otherUserId }).lean(),
                Anuncio.findById(room.assetId).lean(),
                getLatestMessage(room._id.toString())
            ]);
            
            // Construir a URL do avatar usando a rota da API ou a URL salva
            const avatarUrl = otherUser?.fotoPerfilUrl || `/api/avatar/${otherUserId}`;

            return {
                id: room._id.toString(),
                assetId: room.assetId,
                assetName: asset?.titulo || 'Ativo Desconhecido',
                name: otherUser?.nome || 'Usuário Desconhecido',
                avatar: avatarUrl,
                lastMessage: lastMessage?.text || 'Nenhuma mensagem ainda.',
                time: new Date(lastMessage.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
                unread: 0, // Placeholder
                type: asset?.tipo || 'other',
                participants: [room.buyerId, room.sellerId]
            };
        })
    );
    
    return NextResponse.json({ ok: true, conversations });

  } catch (error: any) {
    console.error('Error fetching chat list:', error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
