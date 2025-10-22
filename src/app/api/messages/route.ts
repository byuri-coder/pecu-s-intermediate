// src/app/api/messages/route.ts
import { NextResponse } from 'next/server';
import { connectDB, DISABLE_MONGO } from '@/lib/mongodb';
import { Mensagem } from '@/models/Mensagem';

export async function POST(req: Request) {
  try {
    const db = await connectDB();
    if (!db) {
      // Mock response for environments without MongoDB
      const body = await req.json();
      return NextResponse.json({ ok: true, message: { _id: "mock_message_id", ...body } }, { status: 201 });
    }
    
    const body = await req.json();
    const { chatId, senderId, receiverId, type, text, fileUrl, fileName, fileType, location } = body;

    if (!chatId || !senderId || !receiverId || !type) {
      return NextResponse.json({ ok: false, error: 'chatId, senderId, receiverId, e type são obrigatórios' }, { status: 400 });
    }

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
      status: 'sent',
    });

    // We don't need to emit from here if the client is polling
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
       // Return empty array for mocked environments
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
