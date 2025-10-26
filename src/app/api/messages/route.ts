
// src/app/api/messages/route.ts
import { NextResponse } from 'next/server';
import { connectDB, DISABLE_MONGO } from '@/lib/mongodb';
import { Mensagem } from '@/models/Mensagem';
import { Usuario } from '@/models/Usuario'; // Importar o modelo de usuário

export async function POST(req: Request) {
  try {
    const db = await connectDB();
    if (!db) {
      const body = await req.json();
      const user = await Usuario.findOne({ uidFirebase: body.senderId }).lean();
      return NextResponse.json({ ok: true, message: { _id: "mock_message_id", ...body, user: { name: user?.nome, profileImage: user?.avatarId || null } } }, { status: 201 });
    }
    
    const body = await req.json();
    const { chatId, senderId, receiverId, type, text, fileUrl, fileName, fileType, location } = body;

    if (!chatId || !senderId || !receiverId || !type) {
      return NextResponse.json({ ok: false, error: 'chatId, senderId, receiverId, e type são obrigatórios' }, { status: 400 });
    }
    
    // Buscar o usuário para embutir os dados
    const senderUser = await Usuario.findOne({ uidFirebase: senderId }).lean();

    const newMessage = await Mensagem.create({
      chatId,
      senderId,
      receiverId,
      type,
      text,
      fileUrl,
      fileName,
      fileType,
      location,
      user: { // Embutir dados do usuário na mensagem
          name: senderUser?.nome || 'Usuário Desconhecido',
          profileImage: senderUser?.avatarId || null, // Usar o avatarId do banco de dados
      }
    });

    return NextResponse.json({ ok: true, message: newMessage });
  } catch (error: any) {
    console.error('Error in /api/messages (POST):', error);
    return NextResponse.json({ ok: false, error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const db = await connectDB();
    if (!db) {
      return NextResponse.json({ ok: true, messages: [] });
    }

    const { searchParams } = new URL(req.url);
    const chatId = searchParams.get('chatId');

    if (!chatId) {
      return NextResponse.json({ ok: false, error: 'chatId é um parâmetro de busca obrigatório' }, { status: 400 });
    }

    const messages = await Mensagem.find({ chatId }).sort({ createdAt: 'asc' }).lean();
    
    return NextResponse.json({ ok: true, messages });
  } catch (error: any) {
    console.error('Error in /api/messages (GET):', error);
    return NextResponse.json({ ok: false, error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
    
