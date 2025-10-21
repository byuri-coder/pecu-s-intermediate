
'use client';

import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import { ChatList } from './chat-list';
import type { Conversation, Message, Asset, AssetType } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { MessageSquareText, Loader2 } from 'lucide-react';
import { NegotiationChat } from './negotiation-chat';
import { ActiveChatHeader } from './active-chat-header';
import { db, app } from '@/lib/firebase';
import { collection, onSnapshot, query, orderBy, serverTimestamp, doc, setDoc, addDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { usePersistentState } from './use-persistent-state';
import { useToast } from '@/hooks/use-toast';

export function NegotiationHubPageClient() {
  const searchParams = useSearchParams();
  const activeChatId = searchParams.get('id');
  const auth = getAuth(app);
  const currentUser = auth.currentUser;
  const { toast } = useToast();

  const [conversations, setConversations] = usePersistentState<Conversation[]>('conversations', []);
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [asset, setAsset] = React.useState<Asset | null | 'loading'>('loading');

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


  // Effect for fetching real messages from Firestore
  React.useEffect(() => {
    if (!activeChatId || !currentUser) {
        setMessages([]); // Clear messages if no chat is selected
        return;
    }

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

  const handleSendMessage = async (msg: Omit<Message, 'id' | 'timestamp' | 'avatar' | 'sender'>) => {
    if (!currentUser || !asset || !('ownerId' in asset) || !asset.ownerId || !activeChatId) {
        toast({ title: "Erro de autenticação ou de negociação", description: "Não é possível enviar a mensagem.", variant: "destructive" });
        return;
    }
    
    const negotiationId = `neg_${activeChatId}`;
    const messagesCollection = collection(db, 'negociacoes', negotiationId, 'messages');
    
    try {
      await addDoc(messagesCollection, {
          senderId: currentUser.uid,
          receiverId: asset.ownerId, 
          content: msg.content,
          type: msg.type,
          timestamp: serverTimestamp(),
          status: 'sent',
      });

      const lastMessageText = msg.type === 'text' ? msg.content : `Anexo: ${msg.type}`;
      
      // Update conversation in localStorage
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
    }
  };


  return (
    <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-4 container mx-auto max-w-full py-8 px-4 sm:px-6 lg:px-8 h-[calc(100vh_-_theme(spacing.14))]">
        <div className="md:col-span-4 lg:col-span-3 h-full">
             <ChatList conversations={conversations} activeChatId={activeChatId} />
        </div>
        <div className="md:col-span-8 lg:col-span-9 h-full flex flex-col items-center justify-center">
            {asset === 'loading' ? (
                 <Loader2 className="h-10 w-10 animate-spin"/>
            ) : activeConversation ? (
                 <Card className="h-full w-full flex flex-col">
                    <ActiveChatHeader 
                        conversation={activeConversation}
                        assetId={activeConversation.assetId}
                    />
                    <CardContent className="flex-1 flex flex-col p-4 pt-0">
                       <NegotiationChat messages={messages} onSendMessage={handleSendMessage} />
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
