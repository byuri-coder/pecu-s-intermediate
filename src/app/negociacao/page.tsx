
'use client';

import * as React from 'react';
import { ChatList } from './chat-list';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { MessageSquareText, Loader2 } from 'lucide-react';
import { usePersistentState } from './use-persistent-state';
import type { Conversation } from '@/lib/types';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { app } from '@/lib/firebase';
import { useRouter } from 'next/navigation';


export default function NegotiationHubPage() {
    const [conversations, setConversations] = usePersistentState<Conversation[]>('conversations', []);
    const [loading, setLoading] = React.useState(true);
    const router = useRouter();

    React.useEffect(() => {
        const auth = getAuth(app);
        const unsubscribe = onAuthStateChanged(auth, user => {
            if (user) {
                // If there's an active conversation, redirect to the first one
                if (conversations.length > 0) {
                    const firstConvo = conversations[0];
                    router.replace(`/negociacao/${firstConvo.id}?type=${firstConvo.type}`);
                } else {
                     setLoading(false);
                }
            } else {
                router.replace('/login');
            }
        });

        return () => unsubscribe();
    }, [conversations, router]);


  return (
    <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-4 container mx-auto max-w-full py-8 px-4 sm:px-6 lg:px-8 h-[calc(100vh_-_theme(spacing.14))]">
      <div className="md:col-span-4 lg:col-span-3 h-full">
        <ChatList conversations={conversations} activeChatId={null} />
      </div>
      <div className="md:col-span-8 lg:col-span-9 h-full flex flex-col items-center justify-center">
        {loading ? (
             <Loader2 className="h-10 w-10 animate-spin"/>
        ) : (
             <Card className="w-full max-w-md text-center border-dashed">
                <CardHeader>
                    <div className="mx-auto bg-secondary text-secondary-foreground p-4 rounded-full w-fit mb-4">
                        <MessageSquareText className="h-10 w-10" />
                    </div>
                    <CardTitle>Selecione uma Negociação</CardTitle>
                    <CardDescription>
                        Escolha uma conversa da lista para visualizar as mensagens ou inicie uma nova negociação a partir da página de um ativo.
                    </CardDescription>
                </CardHeader>
            </Card>
        )}
      </div>
    </div>
  );
}

