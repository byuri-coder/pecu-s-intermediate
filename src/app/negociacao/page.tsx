
'use client';

import * as React from 'react';
import { ChatList, type Conversation } from './chat-list';
import { usePersistentState } from './use-persistent-state';
import { MessageSquareText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function NegotiationHubPage() {
  const [conversations, setConversations] = usePersistentState<Conversation[]>('conversations', []);

  return (
    <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-4 container mx-auto max-w-full py-8 px-4 sm:px-6 lg:px-8 h-full">
        <div className="md:col-span-4 lg:col-span-3 h-full">
             <ChatList conversations={conversations} />
        </div>
        <div className="md:col-span-8 lg:col-span-9 h-full flex flex-col items-center justify-center">
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
        </div>
    </div>
  );
}
