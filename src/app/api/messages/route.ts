import { NextResponse } from 'next/server';
import { connectDB, DISABLE_MONGO } from "@/lib/mongodb";
import { Mensagem } from "@/models/Mensagem";

// POST: Salva uma nova mensagem no banco de dados para um chat específico
export async function POST(req: Request) {
  if (DISABLE_MONGO) {
    return NextResponse.json({ ok: true, message: 'Message stored in-memory (mock)' });
  }

  try {
    await connectDB();
    const body = await req.json();
    
    // Validação básica
    if (!body.chatId || !body.message || !body.senderId) {
      return NextResponse.json({ ok: false, error: 'chatId, message, e senderId são obrigatórios' }, { status: 400 });
    }

    const newMessage = await Mensagem.create({
      chatId: body.chatId,
      senderId: body.senderId,
      content: body.message,
      type: body.type || 'text', // Default para texto se não especificado
    });
    
    return NextResponse.json({ ok: true, message: 'Message stored in MongoDB', data: newMessage });
  } catch (error: any) {
    console.error('Erro em /api/messages (POST):', error);
    return NextResponse.json({ ok: false, error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

// GET: Obtém todas as mensagens de um chat específico
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const chatId = searchParams.get('chatId');

  if (!chatId) {
    return NextResponse.json({ ok: false, error: 'chatId é um parâmetro obrigatório' }, { status: 400 });
  }

  if (DISABLE_MONGO) {
    return NextResponse.json({ ok: true, messages: [] });
  }

  try {
    await connectDB();
    
    const messages = await Mensagem.find({ chatId }).sort({ createdAt: 'asc' }).lean();

    return NextResponse.json({ ok: true, messages });
  } catch (error: any) {
    console.error('Erro em /api/messages (GET):', error);
    return NextResponse.json({ ok: false, error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
