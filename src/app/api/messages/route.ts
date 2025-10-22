import { NextResponse } from 'next/server';

// This is a temporary in-memory store.
// In a real application, you would use a database like MongoDB or Firestore.
let messages: any[] = [];

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Basic validation
    if (!body.chatId || !body.message) {
      return NextResponse.json({ ok: false, error: 'chatId and message are required' }, { status: 400 });
    }

    const newMessage = {
      chatId: body.chatId,
      ...body.message,
      // In a real backend, you'd assign a proper ID and timestamp
      id: `server-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit'}),
      sender: 'other', // Simulate it comes from the other user for the receiver
    };

    messages.push(newMessage);
    console.log('New message received and stored in-memory:', newMessage);
    
    return NextResponse.json({ ok: true, message: 'Message stored' });
  } catch (error: any) {
    console.error('Error in /api/messages (POST):', error);
    return NextResponse.json({ ok: false, error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const chatId = searchParams.get('chatId');

    if (!chatId) {
      return NextResponse.json({ ok: false, error: 'chatId is a required query parameter' }, { status: 400 });
    }

    const filteredMessages = messages.filter((m) => m.chatId === chatId);
    
    return NextResponse.json(filteredMessages);
  } catch (error: any) {
    console.error('Error in /api/messages (GET):', error);
    return NextResponse.json({ ok: false, error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
