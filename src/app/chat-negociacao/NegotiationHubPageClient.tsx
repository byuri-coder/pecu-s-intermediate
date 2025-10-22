'use client';

import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import { ChatList } from './chat-list';
import type { Conversation, Message, Asset, AssetType } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { MessageSquareText, Loader2 } from 'lucide-react';
import { NegotiationChat } from './negotiation-chat';
import { ActiveChatHeader } from './active-chat-header';
import { useUser } from '@/firebase';
import { usePersistentState } from './use-persistent-state';
import { useToast } from '@/hooks/use-toast';

export function NegotiationHubPageClient() {
  const searchParams = useSearchParams();
  const activeChatId = searchParams.get('id');
  const { user: currentUser, loading: userLoading } = useUser();
  const { toast } = useToast();

  const conversationKey = currentUser ? `conversations_${currentUser.uid}` : 'conversations';
  const [conversations, setConversations] = usePersistentState<Conversation[]>(conversationKey, []);
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [asset, setAsset] = React.useState<Asset | null | 'loading'>('loading');
  const [isSending, setIsSending] = React.useState(false);
  const [messagesLoading, setMessagesLoading] = React.useState(true);

  React.useEffect(() => {
    if (!currentUser) {
        setConversations([]);
    }
  }, [currentUser, setConversations]);


  const activeConversation = React.useMemo(() => {
    return conversations.find(c => c.id === activeChatId) || null;
  }, [activeChatId, conversations]);

  const assetType = activeConversation?.type;

  // Effect to fetch asset details when chat changes
  React.useEffect(() => {
    async function getAssetDetails(id: string, type: AssetType) {
        setAsset('loading');
        try {
            const res = await fetch(`/api/anuncios/get/${id}`);
            if (res.ok) {
              const data = await res.json();
              if (data.ok && data.anuncio?.tipo === type) {
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
    
    if (activeChatId && assetType) {
        getAssetDetails(activeChatId, assetType);
    } else {
        setAsset(null);
    }
  }, [activeChatId, assetType]);


  // Real-time message fetching simulation
  React.useEffect(() => {
    if (!activeChatId || !currentUser) {
      setMessages([]);
      setMessagesLoading(false);
      return;
    }

    let isMounted = true;
    let intervalId: NodeJS.Timeout;

    const fetchMessages = async () => {
      try {
        setMessagesLoading(true);
        const response = await fetch(`/api/messages?chatId=${activeChatId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch messages');
        }
        const data = await response.json();
        if (isMounted && data.ok) {
          const newMessages: Message[] = data.messages.map((msg: any) => ({
              id: msg._id,
              sender: msg.senderId === currentUser.uid ? 'me' : 'other',
              content: msg.text || msg.fileUrl || (msg.location ? `https://www.google.com/maps?q=${msg.location.latitude},${msg.location.longitude}` : 'Conteúdo inválido'),
              type: msg.type,
              timestamp: new Date(msg.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
              avatar: msg.senderId === currentUser.uid ? currentUser.photoURL : activeConversation?.avatar,
          }));
          setMessages(newMessages);
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
      } finally {
        if(isMounted) setMessagesLoading(false);
      }
    };
    
    fetchMessages(); // initial fetch
    intervalId = setInterval(fetchMessages, 3000); // poll every 3 seconds
    
    return () => {
        isMounted = false;
        clearInterval(intervalId);
    };

  }, [activeChatId, currentUser, activeConversation?.avatar]);

  const handleSendMessage = async (msg: Omit<Message, 'id' | 'timestamp' | 'avatar' | 'sender'>) => {
    if (!currentUser || !asset || !('ownerId' in asset) || !asset.ownerId || !activeChatId) {
        toast({ title: "Erro de autenticação ou de negociação", description: "Não é possível enviar a mensagem.", variant: "destructive" });
        return;
    }
    setIsSending(true);

    const receiverId = currentUser.uid === asset.ownerId 
      ? conversations.find(c => c.id === activeChatId)?.participants?.find(p => p !== currentUser.uid) ?? 'unknown_buyer'
      : asset.ownerId;
      
    if(!receiverId) {
       toast({ title: "Erro", description: "Não foi possível identificar o destinatário.", variant: "destructive" });
       setIsSending(false);
       return;
    }

    const payload: any = {
        chatId: activeChatId,
        senderId: currentUser.uid,
        receiverId: receiverId,
        type: msg.type,
    };
    
    if (msg.type === 'text') payload.text = msg.content;
    else if (msg.type === 'image' || msg.type === 'pdf') {
        payload.fileUrl = msg.content;
        payload.fileName = msg.content.split('/').pop();
        payload.fileType = msg.type;
    } else if (msg.type === 'location') {
        const [lat, lng] = msg.content.split('?q=')[1].split(',');
        payload.location = { latitude: parseFloat(lat), longitude: parseFloat(lng) };
    }


    try {
      const response = await fetch('/api/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
      });
      if(!response.ok) throw new Error("Failed to send message");

      // Optimistic update locally for instant feedback
      const tempId = Date.now().toString();
      const optimisticMessage: Message = {
        id: tempId,
        sender: 'me',
        content: msg.content,
        type: msg.type,
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        avatar: currentUser.photoURL,
      }
      setMessages(prev => [...prev, optimisticMessage]);


      // Update conversation in localStorage
      const lastMessageText = msg.type === 'text' ? msg.content : `Anexo: ${msg.type}`;
      setConversations(prevConvos => {
          const convoIndex = prevConvos.findIndex(c => c.id === activeChatId);
          if (convoIndex > -1) {
              const updatedConvos = [...prevConvos];
              const [existingConvo] = updatedConvos.splice(convoIndex, 1);
              return [{ ...existingConvo, lastMessage: lastMessageText, time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) }, ...updatedConvos];
          }
          return prevConvos;
      });

    } catch(error) {
        console.error("Error sending message:", error);
        toast({ title: "Erro ao Enviar", description: "Não foi possível enviar a sua mensagem.", variant: "destructive" });
    } finally {
        setIsSending(false);
    }
  };


  return (
    <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-4 container mx-auto max-w-full py-8 px-4 sm:px-6 lg:px-8 h-[calc(100vh_-_theme(spacing.14))]">
        <div className="md:col-span-4 lg:col-span-3 h-full">
             <ChatList conversations={conversations} activeChatId={activeChatId} />
        </div>
        <div className="md:col-span-8 lg:col-span-9 h-full flex flex-col items-center justify-center">
            {asset === 'loading' || userLoading ? (
                 <Loader2 className="h-10 w-10 animate-spin"/>
            ) : activeConversation ? (
                 <Card className="h-full w-full flex flex-col">
                    <ActiveChatHeader 
                        conversation={activeConversation}
                        assetId={activeConversation.assetId}
                    />
                    <CardContent className="flex-1 flex flex-col p-4 pt-0">
                       <NegotiationChat messages={messages} onSendMessage={handleSendMessage} isSending={isSending} isLoading={messagesLoading} />
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