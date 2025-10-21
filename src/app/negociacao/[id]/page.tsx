
'use client';

import * as React from 'react';
import { notFound, useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Landmark, Handshake, Edit, Send, Paperclip, ShieldCheck, UserCircle, MapPin, LocateFixed, Map, Loader2 } from 'lucide-react';
import { NegotiationChat, type Message } from '../negotiation-chat';
import { Input } from '@/components/ui/input';
import { ChatList, type Conversation } from '../chat-list';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { CarbonCredit, RuralLand, TaxCredit } from '@/lib/types';
import { usePersistentState } from '../use-persistent-state';
import { db, app } from '@/lib/firebase';
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, doc, setDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { placeholderCredits, placeholderRuralLands, placeholderTaxCredits } from '@/lib/placeholder-data';


type AssetType = 'carbon-credit' | 'tax-credit' | 'rural-land';
type Asset = CarbonCredit | RuralLand | TaxCredit;


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
  const assetType = (searchParams?.get('type') as AssetType) ?? 'carbon-credit';
  const { toast } = useToast();
  const auth = getAuth(app);
  const currentUser = auth.currentUser;

  const [asset, setAsset] = React.useState<Asset | null | 'loading'>('loading');
  
  const negotiationId = `neg_${params.id}`;
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [newMessage, setNewMessage] = React.useState('');
  const [conversations, setConversations] = usePersistentState<Conversation[]>('conversations', []);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    async function getAssetDetails(id: string, type: AssetType) {
        setAsset('loading');
        try {
            const res = await fetch(`/api/anuncios/get/${id}`);
            if (res.ok) {
              const data = await res.json();
              if (data.ok && data.anuncio?.tipo === type) {
                  const anuncio = data.anuncio;
                  const formattedAsset = {
                      ...anuncio,
                      id: anuncio._id,
                      ...anuncio.metadados,
                      ownerId: anuncio.uidFirebase, // Ensure ownerId is mapped
                      price: anuncio.price,
                      pricePerCredit: anuncio.price,
                      images: anuncio.imagens,
                  };
                  setAsset(formattedAsset as Asset);
                  return; // Exit if found via API
              }
            }

            // Fallback to placeholder data if API fails or doesn't find it
            console.warn(`Asset with ID ${id} not found via API, falling back to placeholders.`);
            let placeholderData: Asset | undefined;
            if (type === 'carbon-credit') {
              placeholderData = placeholderCredits.find(c => c.id === id);
            } else if (type === 'rural-land') {
              placeholderData = placeholderRuralLands.find(l => l.id === id);
            } else if (type === 'tax-credit') {
              placeholderData = placeholderTaxCredits.find(t => t.id === id);
            }
            
            if (placeholderData) {
              setAsset(placeholderData);
            } else {
              setAsset(null); // Not found in API or placeholders
            }

        } catch(err) {
            console.error("Failed to fetch asset", err);
            setAsset(null);
        }
    }
    
    if (params.id) {
        getAssetDetails(params.id, assetType);
    }
  }, [params.id, assetType]);
  
  // Real-time message listener
    React.useEffect(() => {
        if (!negotiationId) return;

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
                    avatar: data.senderId === currentUser?.uid ? currentUser?.photoURL : 'https://picsum.photos/seed/avatar2/40/40'
                } as Message;
            });
            setMessages(newMessages);
        });

        return () => unsubscribe();
    }, [negotiationId, currentUser?.uid, params.id]);

  if (asset === 'loading') {
    return <div className="flex h-screen w-full items-center justify-center"><Loader2 className="h-10 w-10 animate-spin"/></div>;
  }
  
  if (!asset) {
    notFound();
  }

  const assetName = 'title' in asset ? asset.title : `Crédito de ${'taxType' in asset ? asset.taxType : 'creditType' in asset ? asset.creditType : ''}`;
  const sellerName = 'owner' in asset ? asset.owner : ('sellerName' in asset ? asset.sellerName : 'Vendedor Desconhecido');
  const sellerAvatar = 'https://picsum.photos/seed/avatar2/40/40';

  const addMessage = async (msg: Omit<Message, 'id' | 'timestamp' | 'avatar' | 'sender'>) => {
      
    if (!currentUser || !asset.ownerId) {
        toast({ title: "Erro de autenticação", description: "Você precisa estar logado para enviar mensagens.", variant: "destructive" });
        return;
    }
    
    const messagesCollection = collection(db, 'negociacoes', negotiationId, 'messages');
    await addDoc(messagesCollection, {
        senderId: currentUser.uid,
        receiverId: asset.ownerId, // This should be the other participant's UID
        content: msg.content,
        type: msg.type,
        timestamp: serverTimestamp(),
        status: 'sent',
    });


    const lastMessageText = msg.type === 'text' ? msg.content : `Anexo: ${msg.type}`;
    
    // Update or create conversation in localStorage
    const newConversation: Conversation = {
        id: params.id,
        name: sellerName,
        avatar: sellerAvatar,
        lastMessage: lastMessageText,
        time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        unread: 0,
        type: assetType,
    };
    
    setConversations(prevConvos => {
        const existingConvoIndex = prevConvos.findIndex(c => c.id === newConversation.id);
        if (existingConvoIndex > -1) {
            const updatedConvos = [...prevConvos];
            const [existingConvo] = updatedConvos.splice(existingConvoIndex, 1);
            return [{ ...existingConvo, lastMessage: newConversation.lastMessage, time: newConversation.time }, ...updatedConvos];
        }
        return [newConversation, ...prevConvos];
    });
  }

  const handleSendMessage = () => {
    const messageContent = newMessage.trim();
    if (messageContent === '') return;

    const isGoogleMapsUrl = /^(https?:\/\/)?(www\.)?(google\.com\/maps|maps\.app\.goo\.gl)\/.+/.test(messageContent);
    const messageType = isGoogleMapsUrl ? 'location' : 'text';

    addMessage({ content: messageContent, type: messageType });
    setNewMessage('');
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      const fileType = file.type.startsWith('image/') ? 'image' : 'pdf';
      // In a real app, upload the file to Firebase Storage here and get the URL
      const content = fileType === 'image' ? URL.createObjectURL(file) : file.name;
      addMessage({ content: content, type: fileType });
    }
  };

  const handleSendCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Geolocalização não suportada",
        description: "Seu navegador não permite o compartilhamento de localização.",
        variant: "destructive"
      });
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const url = `https://www.google.com/maps?q=${latitude},${longitude}`;
        addMessage({ content: url, type: 'location' });
      },
      (error) => {
        toast({
            title: "Erro ao obter localização",
            description: "Não foi possível obter sua localização. Verifique as permissões do seu navegador.",
            variant: "destructive"
        });
      }
    );
  };
  
  const handleChooseOnMap = () => {
    window.open('https://maps.google.com', '_blank', 'noopener,noreferrer');
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };


  return (
    <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-4 container mx-auto max-w-full py-8 px-4 sm:px-6 lg:px-8 h-full">
        <div className="md:col-span-4 lg:col-span-3 h-full">
             <ChatList conversations={conversations} />
        </div>
        
        <div className="md:col-span-8 lg:col-span-9 h-full flex flex-col gap-4">
            <Card className="flex-grow flex flex-col">
                <CardHeader className="flex-row items-center justify-between">
                    <Sheet>
                        <SheetTrigger asChild>
                            <div className="flex items-center gap-3 cursor-pointer group">
                                <Avatar className="h-11 w-11">
                                    <AvatarImage src={sellerAvatar} />
                                    <AvatarFallback>{sellerName.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <CardTitle className="text-xl group-hover:underline">{sellerName}</CardTitle>
                                    <CardDescription>
                                        Negociando: <Link className="text-primary hover:underline" href={`${getAssetTypeRoute(assetType)}/${asset.id}`}>{assetName}</Link>
                                    </CardDescription>
                                </div>
                            </div>
                        </SheetTrigger>
                        <SheetContent className="sm:max-w-md">
                            <SheetHeader>
                                <SheetTitle>Informações do Vendedor</SheetTitle>
                                <SheetDescription>
                                    Perfil e documentos relacionados ao ativo em negociação.
                                </SheetDescription>
                            </SheetHeader>
                            <div className="py-6 space-y-6">
                                <Card>
                                    <CardHeader className="p-4">
                                        <div className="flex items-center gap-4">
                                             <Avatar className="h-16 w-16">
                                                <AvatarImage src={sellerAvatar} />
                                                <AvatarFallback><UserCircle className="h-8 w-8"/></AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <h3 className="text-lg font-semibold">{sellerName}</h3>
                                                <p className="text-sm text-muted-foreground">Membro desde 2023</p>
                                                <p className="text-sm text-muted-foreground">Verificado</p>
                                            </div>
                                        </div>
                                    </CardHeader>
                                </Card>

                            </div>
                        </SheetContent>
                    </Sheet>
                     <div className="space-x-2">
                        <Button variant="outline" size="sm" asChild>
                            <Link href={`/negociacao/${params.id}/ajuste?type=${assetType}`}>
                                <Edit className="mr-2 h-4 w-4"/> ajustar e fechar contrato
                            </Link>
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col p-4 pt-0">
                    <NegotiationChat messages={messages} />
                    <div className="mt-4 flex items-center gap-2">
                        <Input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            onChange={handleFileChange}
                            accept="image/*,application/pdf"
                        />
                         <Button variant="ghost" size="icon" onClick={() => fileInputRef.current?.click()}>
                            <Paperclip className="h-5 w-5" />
                            <span className="sr-only">Anexar arquivo</span>
                        </Button>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <MapPin className="h-5 w-5" />
                                    <span className="sr-only">Enviar localização</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem onClick={handleSendCurrentLocation}>
                                    <LocateFixed className="mr-2 h-4 w-4"/>
                                    Localização Atual
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={handleChooseOnMap}>
                                    <Map className="mr-2 h-4 w-4"/>
                                    Escolher no Mapa
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <Input 
                            placeholder="Digite sua mensagem..." 
                            value={newMessage} 
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyDown={handleKeyDown}
                         />
                        <Button id="send-message-button" onClick={handleSendMessage}>
                          <Send className="h-5 w-5" />
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
