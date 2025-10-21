
'use client';

import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import type { Conversation, Message } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { MessageSquareText } from 'lucide-react';
import { db, app } from '@/lib/firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { ChatList } from './chat-list';
import { NegotiationChat } from './negotiation-chat';
import { ActiveChatHeader } from './active-chat-header';
import { usePersistentState } from './use-persistent-state';

const mockConversations: Conversation[] = [
    {
        id: 'tax-001',
        assetId: 'tax-001',
        assetName: 'Crédito de ICMS',
        name: 'José Carlos Pereira',
        avatar: 'https://picsum.photos/seed/jcp/40/40',
        lastMessage: 'Ofereço R$ 220.000,00 para pagamento à vista.',
        time: '14:36',
        unread: 1,
        type: 'tax-credit',
    }
];

const mockTestMessages: Message[] = [
    {
        id: 'msg-1',
        sender: 'other',
        content: 'Olá! Tenho interesse no crédito de ICMS. Ele ainda está disponível?',
        type: 'text',
        timestamp: '14:30',
        avatar: 'https://picsum.photos/seed/jcp/40/40',
    },
    {
        id: 'msg-2',
        sender: 'me',
        content: 'Olá, José Carlos! Sim, está disponível. Qual seria a sua proposta?',
        type: 'text',
        timestamp: '14:32',
    },
     {
        id: 'msg-3',
        sender: 'other',
        content: 'https://picsum.photos/seed/doc/400/300',
        type: 'image',
        timestamp: '14:35',
        avatar: 'https://picsum.photos/seed/jcp/40/40',
    },
    {
        id: 'msg-4',
        sender: 'other',
        content: 'Ofereço R$ 220.000,00 para pagamento à vista.',
        type: 'text',
        timestamp: '14:36',
        avatar: 'https://picsum.photos/seed/jcp/40/40',
    },
];


export default function NegotiationHubPage() {
  const searchParams = useSearchParams();
  const activeChatId = searchParams.get('id');
  const auth = getAuth(app);
  const currentUser = auth.currentUser;

  // Initialize state directly with mock data
  const [conversations, setConversations] = usePersistentState<Conversation[]>('conversations', mockConversations);
  const [messages, setMessages] = React.useState<Message[]>([]);
  
  const activeConversation = React.useMemo(() => {
    return conversations.find(c => c.id === activeChatId) || null;
  }, [activeChatId, conversations]);

  // Effect for fetching real messages from Firestore
  React.useEffect(() => {
    if (!activeChatId || !currentUser) {
        setMessages([]); // Clear messages if no chat is selected
        return;
    }
    
    // Use mock messages for the test chat
    if (activeChatId === 'tax-001') {
        setMessages(mockTestMessages);
        return;
    }

    // Firestore listener for real chats
    const negotiationId = `neg_${activeChatId}`;
    const messagesCollection = collection(db, 'negociacoes', negotiationId, 'messages');
    const q = query(messagesCollection, orderBy('timestamp', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
        const newMessages: Message[] = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                sender: data.senderId === currentUser?.uid ? 'me' : 'other',
                content: data.content,
                type: data.type,
                timestamp: data.timestamp?.toDate()?.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) || '',
                avatar: data.senderId === currentUser?.uid ? currentUser?.photoURL : activeConversation?.avatar
            } as Message;
        });
        setMessages(newMessages);
    }, (error) => {
        console.error("Error fetching messages:", error);
        setMessages([]);
    });

    return () => unsubscribe();
  }, [activeChatId, currentUser, activeConversation?.avatar]);

  const addMessage = (msg: Omit<Message, 'id' | 'timestamp' | 'avatar' | 'sender'>) => {
    const newMessage: Message = {
        id: `msg-${Date.now()}`,
        sender: 'me',
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        ...msg
    };
    setMessages(prev => [...prev, newMessage]);
  };


  return (
    <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-4 container mx-auto max-w-full py-8 px-4 sm:px-6 lg:px-8 h-[calc(100vh_-_theme(spacing.14))]">
        <div className="md:col-span-4 lg:col-span-3 h-full">
             <ChatList conversations={conversations} activeChatId={activeChatId} />
        </div>
        <div className="md:col-span-8 lg:col-span-9 h-full flex flex-col items-center justify-center">
            {activeConversation ? (
                 <Card className="h-full w-full flex flex-col">
                    <ActiveChatHeader 
                        conversation={activeConversation}
                        assetId={activeConversation.assetId}
                    />
                    <CardContent className="flex-1 flex flex-col p-4 pt-0">
                       <NegotiationChat messages={messages} onSendMessage={addMessage} />
                    </CardContent>
                </Card>
            ) : (
                <Card className="w-full max-w-md text-center border-dashed">
                    <CardHeader>
                        <div className="mx-auto bg-secondary text-secondary-foreground p-4 rounded-full w-fit mb-4">
                            <MessageSquareText className="h-10 w-10"/>
                        </div>
                        <CardTitle>Selecione uma Negociação</CardTitle>
                        <CardDescription>
                            Escolha uma conversa da lista para visualizar as mensagens e continuar a negociação.
                        </CardDescription>
                    </CardHeader>
                </Card>
            )}
        </div>
    </div>
  );
}
