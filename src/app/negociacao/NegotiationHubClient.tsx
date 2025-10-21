'use client';

import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import { ChatList } from './chat-list';
import { NegotiationChat } from './negotiation-chat';
import { ActiveChatHeader } from './active-chat-header';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { MessageSquareText } from 'lucide-react';
import { db, app } from '@/lib/firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { usePersistentState } from './use-persistent-state';
import type { Conversation, Message } from '@/lib/types';

const mockConversations: Conversation[] = [];
const mockTestMessages: Message[] = [];

export default function NegotiationHubClient() {
  const searchParams = useSearchParams();
  const activeChatId = searchParams.get('id');
  const auth = getAuth(app);
  const currentUser = auth.currentUser;

  const [conversations, setConversations] = usePersistentState<Conversation[]>('conversations', mockConversations);
  const [messages, setMessages] = React.useState<Message[]>([]);

  const activeConversation = React.useMemo(() => {
    return conversations.find((c) => c.id === activeChatId) || null;
  }, [activeChatId, conversations]);

  React.useEffect(() => {
    if (!activeChatId || !currentUser) {
      setMessages([]);
      return;
    }

    if (activeChatId === 'tax-001') {
      setMessages(mockTestMessages);
      return;
    }

    const negotiationId = `neg_${activeChatId}`;
    const messagesCollection = collection(db, 'negociacoes', negotiationId, 'messages');
    const q = query(messagesCollection, orderBy('timestamp', 'asc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const newMessages: Message[] = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            sender: data.senderId === currentUser?.uid ? 'me' : 'other',
            content: data.content,
            type: data.type,
            timestamp:
              data.timestamp?.toDate()?.toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit',
              }) || '',
            avatar: data.senderId === currentUser?.uid ? currentUser?.photoURL : activeConversation?.avatar,
          } as Message;
        });
        setMessages(newMessages);
      },
      (error) => {
        console.error('Error fetching messages:', error);
        setMessages([]);
      }
    );

    return () => unsubscribe();
  }, [activeChatId, currentUser, activeConversation?.avatar]);

  const addMessage = (msg: Omit<Message, 'id' | 'timestamp' | 'avatar' | 'sender'>) => {
    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      sender: 'me',
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      ...msg,
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  return (
    <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-4 container mx-auto max-w-full py-8 px-4 sm:px-6 lg:px-8 h-[calc(100vh_-_theme(spacing.14))]">
      <div className="md:col-span-4 lg:col-span-3 h-full">
        <ChatList conversations={conversations} activeChatId={activeChatId} />
      </div>
      <div className="md:col-span-8 lg:col-span-9 h-full flex flex-col items-center justify-center">
        {activeConversation ? (
          <Card className="h-full w-full flex flex-col">
            <ActiveChatHeader conversation={activeConversation} assetId={activeConversation.assetId} />
            <CardContent className="flex-1 flex flex-col p-4 pt-0">
              <NegotiationChat messages={messages} onSendMessage={addMessage} />
            </CardContent>
          </Card>
        ) : (
          <Card className="w-full max-w-md text-center border-dashed">
            <CardHeader>
              <div className="mx-auto bg-secondary text-secondary-foreground p-4 rounded-full w-fit mb-4">
                <MessageSquareText className="h-10 w-10" />
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
