import { NextResponse } from 'next/server';

// This is a temporary in-memory store for messages.
// In a real application, you would use a database like Firestore.
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
      sender: body.sender, // 'me' or 'other' - in a real app, this would be a user ID
      text: body.message,
      createdAt: new Date(),
    };
    
    messages.push(newMessage);
    console.log('New message received and stored in memory:', newMessage);
    
    // In a real-time system (like with WebSockets), you would broadcast this message to the other user in the chat.
    // Since we're using HTTP polling for this example, the client will fetch messages.

    return NextResponse.json({ ok: true, message: 'Message stored' });
  } catch (error) {
    console.error('Error in /api/messages/route.ts:', error);
    return NextResponse.json({ ok: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const chatId = searchParams.get('chatId');

    if (!chatId) {
      return NextResponse.json({ ok: false, error: 'chatId is required' }, { status: 400 });
    }

    const chatMessages = messages.filter(m => m.chatId === chatId);

    return NextResponse.json({ ok: true, messages: chatMessages });
  } catch (error) {
    console.error('Error in /api/messages/route.ts (GET):', error);
    return NextResponse.json({ ok: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
