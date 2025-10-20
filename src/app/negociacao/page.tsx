
'use client';

import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ChatList, type Conversation } from './chat-list';
import { MessageSquare } from 'lucide-react';
import { usePersistentState } from './use-persistent-state';

const mockConversations: Conversation[] = [
  {
    id: 'cc-003',
    name: 'Gestão de Resíduos Urbanos',
    avatar: 'https://picsum.photos/seed/avatar2/40/40',
    lastMessage: 'Claro, segue o PDF com o relatório...',
    time: '10:45',
    unread: 0,
    type: 'carbon-credit'
  }
];

export default function NegotiationHubPage() {
  const [conversations] = usePersistentState<Conversation[]>('conversations', mockConversations);

  return (
    <div className="flex-1 container mx-auto max-w-full py-8 px-4 sm:px-6 lg:px-8 h-full">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 h-full">
        <div className="md:col-span-4 lg:col-span-3 h-full">
            <ChatList conversations={conversations} />
        </div>
        <div className="md:col-span-8 lg:col-span-9 h-full hidden md:flex">
            <Card className="w-full h-full flex items-center justify-center bg-muted/20 border-dashed">
                <CardContent className="text-center">
                    <MessageSquare className="mx-auto h-16 w-16 text-muted-foreground/30" />
                    <h2 className="mt-4 text-2xl font-semibold">Selecione uma conversa</h2>
                    <p className="mt-2 text-muted-foreground">Escolha uma negociação na lista ao lado para ver os detalhes e documentos.</p>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
