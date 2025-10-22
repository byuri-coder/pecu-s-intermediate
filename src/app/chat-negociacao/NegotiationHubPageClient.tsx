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
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export function NegotiationHubPageClient() {
  const searchParams = useSearchParams();
  const activeChatId = searchParams.get('id');
  const { user: currentUser, loading: userLoading } = useUser();
  const { toast } = useToast();

  const [conversations, setConversations] = usePersistentState<Conversation[]>('conversations', []);
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [asset, setAsset] = React.useState<Asset | null | 'loading'>('loading');
  const [isSending, setIsSending] = React.useState(false);

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


  // Effect for fetching messages from MongoDB via API (polling)
  React.useEffect(() => {
    if (!activeChatId || !currentUser) {
        setMessages([]);
        return;
    }

    const negotiationId = `neg_${activeChatId}`;

    const fetchMessages = async () => {
        try {
            const res = await fetch(`/api/messages?chatId=${negotiationId}`);
            if (res.ok) {
                const data = await res.json();
                if (data.ok) {
                    const formattedMessages: Message[] = data.messages.map((m: any) => ({
                        id: m._id,
                        sender: m.senderId === currentUser.uid ? 'me' : 'other',
                        content: m.text || m.fileUrl || `https://www.google.com/maps?q=${m.location?.latitude},${m.location?.longitude}`,
                        type: m.type,
                        timestamp: new Date(m.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
                        avatar: m.senderId === currentUser.uid ? currentUser.photoURL : activeConversation?.avatar
                    }));
                    setMessages(formattedMessages);
                }
            }
        } catch (error) {
            console.error("Error fetching messages:", error);
            toast({ title: "Erro ao carregar mensagens", variant: "destructive" });
        }
    };
    
    fetchMessages(); // Initial fetch

    // Poll for new messages every 3 seconds to simulate real-time
    const intervalId = setInterval(fetchMessages, 3000);

    return () => clearInterval(intervalId); // Cleanup on unmount

  }, [activeChatId, currentUser, activeConversation?.avatar, toast]);

  const handleSendMessage = async (msg: Omit<Message, 'id' | 'timestamp' | 'avatar' | 'sender'>) => {
    if (!currentUser || !asset || !('ownerId' in asset) || !asset.ownerId || !activeChatId) {
        toast({ title: "Erro de autenticação ou de negociação", description: "Não é possível enviar a mensagem.", variant: "destructive" });
        return;
    }
    setIsSending(true);

    const negotiationId = `neg_${activeChatId}`;

    const receiverId = currentUser.uid === asset.ownerId 
      ? conversations.find(c => c.id === activeChatId)?.participants?.find(p => p !== currentUser.uid) ?? 'unknown_buyer'
      : asset.ownerId;
      
    if(!receiverId) {
       toast({ title: "Erro", description: "Não foi possível identificar o destinatário.", variant: "destructive" });
       setIsSending(false);
       return;
    }

    const payload: any = {
        chatId: negotiationId,
        senderId: currentUser.uid,
        receiverId: receiverId,
        type: msg.type,
    };
    
    if (msg.type === 'text') payload.text = msg.content;
    else if (msg.type === 'image' || msg.type === 'pdf') {
        // In a real app, you would upload the file here and get a permanent URL.
        // For this demo, we'll just pass the temporary blob URL or file name.
        payload.fileUrl = msg.content;
        payload.fileName = msg.content.split('/').pop();
        payload.fileType = msg.type;
    } else if (msg.type === 'location') {
        const [lat, lng] = msg.content.split('?q=')[1].split(',');
        payload.location = { latitude: parseFloat(lat), longitude: parseFloat(lng) };
    }


    try {
      // Ensure negotiation document exists in Firestore for contract management
      const negDocRef = doc(db, 'negociacoes', negotiationId);
      await setDoc(negDocRef, { 
          buyerId: receiverId === asset.ownerId ? currentUser.uid : receiverId,
          sellerId: asset.ownerId,
          assetId: activeChatId,
          updatedAt: new Date(),
       }, { merge: true });

      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        throw new Error("Falha ao enviar mensagem para a API.");
      }

      // Optimistically update UI
      const optimisticMessage: Message = {
        id: `temp-${Date.now()}`,
        sender: 'me',
        content: msg.content,
        type: msg.type,
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        avatar: currentUser.photoURL || undefined,
      };
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
                       <NegotiationChat messages={messages} onSendMessage={handleSendMessage} isSending={isSending} />
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

    