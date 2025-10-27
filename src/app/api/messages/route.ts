
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
      const senderUser = await Usuario.findOne({ uidFirebase: body.senderId }).lean();
      return NextResponse.json({ ok: true, message: { _id: "mock_message_id", ...body, user: { name: senderUser?.nome || 'Mock User', photoURL: `/api/avatar/${body.senderId}` } } }, { status: 201 });
    }
    
    const body = await req.json();
    const { chatId, senderId, receiverId, type, text, fileUrl, fileName, fileType, location } = body;

    if (!chatId || !senderId || !receiverId || !type) {
      return NextResponse.json({ ok: false, error: 'chatId, senderId, receiverId, e type são obrigatórios' }, { status: 400 });
    }
    
    const senderUser = await Usuario.findOne({ uidFirebase: senderId }).lean();

    const newMessageData: any = {
      chatId,
      senderId,
      receiverId,
      type,
      user: {
          name: senderUser?.nome || 'Usuário Desconhecido',
          photoURL: `/api/avatar/${senderId}`
      }
    };

    if (type === 'text') newMessageData.text = text;
    if (type === 'image' || type === 'pdf') {
        newMessageData.fileUrl = fileUrl; // This is the base64 data URI
        newMessageData.fileName = fileName;
        newMessageData.fileType = fileType;
    }
    if (type === 'location') newMessageData.location = location;
    
    const newMessage = await Mensagem.create(newMessageData);

    const responseMessage = {
        ...newMessage.toObject(),
        user: { 
            name: senderUser?.nome || 'Usuário Desconhecido',
            photoURL: `/api/avatar/${senderId}`
        }
    };


    return NextResponse.json({ ok: true, message: responseMessage });
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
    
    const populatedMessages = await Promise.all(messages.map(async (msg) => {
        if (msg.user && msg.user.name && msg.user.photoURL) {
            return msg;
        }
        const sender = await Usuario.findOne({ uidFirebase: msg.senderId }).lean();
        return {
            ...msg,
            user: {
                name: sender?.nome || 'Usuário Desconhecido',
                photoURL: `/api/avatar/${msg.senderId}`
            }
        };
    }));

    return NextResponse.json({ ok: true, messages: populatedMessages });
  } catch (error: any) {
    console.error('Error in /api/messages (GET):', error);
    return NextResponse.json({ ok: false, error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
