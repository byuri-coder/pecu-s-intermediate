'use client';

import * as React from 'react';
import { notFound, useSearchParams, useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Landmark, Handshake, Edit, Send, Paperclip, ShieldCheck, UserCircle, MapPin, LocateFixed, Map, Loader2, MessageSquareText } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { CarbonCredit, RuralLand, TaxCredit, AssetType, Asset, Conversation, Message } from '@/lib/types';
import { db, app } from '@/lib/firebase';
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, doc, setDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { ChatList } from '../chat-list';
import { NegotiationChat } from '../negotiation-chat';
import { ActiveChatHeader } from '../active-chat-header';
import { usePersistentState } from '../use-persistent-state';

function getAssetTypeName(type: AssetType) {
    switch(type) {
        case 'carbon-credit': return 'Crédito de Carbono';
        case 'tax-credit': return 'Crédito Tributário';
        case 'rural-land': return 'Terra Rural';
    }
}

function getAssetTypeRoute(type: AssetType) {
    switch(type) {
        case 'carbon-credit': return '/credito-de-carbono';
        case 'tax-credit': return '/tributos';
        case 'rural-land': return '/terras-rurais';
    }
}


export default function NegotiationPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const auth = getAuth(app);
  const currentUser = auth.currentUser;
  
  const assetType = (searchParams?.get('type') as AssetType | null);
  const activeChatId = params.id;

  const [asset, setAsset] = React.useState<Asset | null | 'loading'>('loading');
  const [messages, setMessages] = React.useState<Message[]>([]);
  
  const [conversations, setConversations] = usePersistentState<Conversation[]>('conversations', []);
  const activeConversation = React.useMemo(() => {
    return conversations.find(c => c.id === activeChatId) || null;
  }, [activeChatId, conversations]);

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
                      ...anuncio.metadados, // Spread metadados first
                      id: anuncio._id,
                      ownerId: anuncio.uidFirebase,
                      price: anuncio.price,
                      status: anuncio.status,
                      description: anuncio.descricao,
                      title: anuncio.titulo,
                      images: anuncio.imagens || [],
                  };
                  setAsset(formattedAsset);

                   // Add to conversations if it's not there
                  setConversations(prevConvos => {
                      if (prevConvos.some(c => c.id === id)) {
                          return prevConvos;
                      }
                      const newConversation: Conversation = {
                          id: id,
                          assetId: id,
                          assetName: anuncio.titulo,
                          name: anuncio.metadados?.sellerName || anuncio.metadados?.owner || 'Vendedor',
                          avatar: 'https://picsum.photos/seed/avatar2/40/40',
                          lastMessage: 'Inicie a conversa...',
                          time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
                          unread: 0,
                          type: type,
                      };
                      return [newConversation, ...prevConvos];
                  });

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
  }, [activeChatId, assetType, setConversations]);
  
  // Real-time message listener
  React.useEffect(() => {
    if (!activeChatId || !currentUser) {
        setMessages([]);
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


  const addMessage = async (msg: Omit<Message, 'id' | 'timestamp' | 'avatar' | 'sender'>) => {
    if (!currentUser || !asset || !('ownerId' in asset) || !asset.ownerId) {
        toast({ title: "Erro de autenticação", description: "Você precisa estar logado para enviar mensagens.", variant: "destructive" });
        return;
    }
    
    const negotiationId = `neg_${activeChatId}`;
    const messagesCollection = collection(db, 'negociacoes', negotiationId, 'messages');
    
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
  }


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
            ) : asset === 'loading' ? (
                <Loader2 className="h-10 w-10 animate-spin"/>
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
