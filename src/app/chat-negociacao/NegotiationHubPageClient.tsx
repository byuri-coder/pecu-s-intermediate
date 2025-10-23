
'use client';

import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import { ChatList } from './chat-list';
import type { Conversation, Asset } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { MessageSquareText, Loader2 } from 'lucide-react';
import { ActiveChatHeader } from './active-chat-header';
import { useUser } from '@/firebase';
import { ChatRoom } from './chat-room';

// This is a mock function, replace with your actual data fetching logic
async function fetchConversationsForUser(userId: string): Promise<Conversation[]> {
    try {
        const response = await fetch(`/api/chat/list?userId=${userId}`);
        if (!response.ok) throw new Error("Failed to fetch conversations");
        const data = await response.json();
        return data.conversations || [];
    } catch (error) {
        console.error(error);
        return [];
    }
}


export function NegotiationHubPageClient() {
  const searchParams = useSearchParams();
  const activeChatId = searchParams.get('id');
  const { user: currentUser, loading: userLoading } = useUser();

  const [conversations, setConversations] = React.useState<Conversation[]>([]);
  const [asset, setAsset] = React.useState<Asset | null | 'loading'>('loading');
  const [conversationsLoading, setConversationsLoading] = React.useState(true);

  React.useEffect(() => {
    if (currentUser) {
      setConversationsLoading(true);
      fetchConversationsForUser(currentUser.uid)
        .then(setConversations)
        .finally(() => setConversationsLoading(false));
    } else if (!userLoading) {
      setConversations([]);
      setConversationsLoading(false);
    }
  }, [currentUser, userLoading]);


  const activeConversation = React.useMemo(() => {
    return conversations.find(c => c.id === activeChatId) || null;
  }, [activeChatId, conversations]);

  // Effect to fetch asset details when chat changes
  React.useEffect(() => {
    async function getAssetDetails(assetId: string) {
        setAsset('loading');
        try {
            const res = await fetch(`/api/anuncios/get/${assetId}`);
            if (res.ok) {
              const data = await res.json();
              if (data.ok) {
                  const anuncio = data.anuncio;
                  const formattedAsset: Asset = {
                      ...anuncio.metadados,
                      id: anuncio._id,
                      ownerId: anuncio.uidFirebase,
                      price: anuncio.price,
                      status: anuncio.status,
                      description: anuncio.descricao,
                      title: anuncio.titulo,
                      images: anuncio.imagens || [],
                  };
                  setAsset(formattedAsset);
                  return;
              }
            }
            setAsset(null); // Not found
        } catch(err) {
            console.error("Failed to fetch asset", err);
            setAsset(null);
        }
    }
    
    if (activeConversation?.assetId) {
        getAssetDetails(activeConversation.assetId);
    } else {
        setAsset(null);
    }
  }, [activeConversation]);

  const receiver = React.useMemo(() => {
    if (!activeConversation || !currentUser) return null;
    const receiverId = activeConversation.participants?.find(p => p !== currentUser.uid);
    return receiverId ? { id: receiverId } : null;
  }, [activeConversation, currentUser]);


  const renderChatContent = () => {
    // Main loading state
    if (userLoading) {
        return <Loader2 className="h-10 w-10 animate-spin"/>;
    }

    // No active chat selected
    if (!activeChatId) {
        return (
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
        );
    }
    
    // Active chat selected, but still loading data
    if (conversationsLoading || !activeConversation || !currentUser || !receiver) {
         return <Loader2 className="h-10 w-10 animate-spin"/>;
    }

    // All data is ready, render the chat room
    return (
        <Card className="h-full w-full flex flex-col">
            <ActiveChatHeader 
                conversation={activeConversation}
                assetId={activeConversation.assetId}
            />
            <CardContent className="flex-1 flex flex-col p-4 pt-0">
                <ChatRoom 
                    chatId={activeChatId}
                    currentUser={currentUser}
                    receiverId={receiver.id}
                />
            </CardContent>
        </Card>
    );
  };

  return (
    <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-4 container mx-auto max-w-full py-8 px-4 sm:px-6 lg:px-8 h-[calc(100vh_-_theme(spacing.14))]">
        <div className="md:col-span-4 lg:col-span-3 h-full">
             <ChatList conversations={conversations} activeChatId={activeChatId} isLoading={conversationsLoading} />
        </div>
        <div className="md:col-span-8 lg:col-span-9 h-full flex flex-col items-center justify-center">
            {renderChatContent()}
        </div>
    </div>
  );
}
