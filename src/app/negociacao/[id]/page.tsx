
'use client';

import * as React from 'react';
import { notFound, useSearchParams, useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Landmark, Handshake, Edit, Send, Paperclip, ShieldCheck, UserCircle, MapPin, LocateFixed, Map, Loader2 } from 'lucide-react';
import { NegotiationChat, type Message } from './negotiation-chat';
import { Input } from '@/components/ui/input';
import { ChatList } from '../chat-list';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { CarbonCredit, RuralLand, TaxCredit, AssetType, Asset, Conversation } from '@/lib/types';
import { usePersistentState } from '../use-persistent-state';
import { db, app } from '@/lib/firebase';
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, doc, setDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

function getAssetTypeRoute(type: AssetType) {
    switch(type) {
        case 'carbon-credit': return '/credito-de-carbono';
        case 'tax-credit': return '/tributos';
        case 'rural-land': return '/terras-rurais';
    }
}


export default function NegotiationPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  
  const assetId = params.id as string;
  const assetType = searchParams.get('type') as AssetType | null;
  
  const { toast } = useToast();
  const auth = getAuth(app);
  const currentUser = auth.currentUser;

  const [asset, setAsset] = React.useState<Asset | null | 'loading'>('loading');
  
  const negotiationId = `neg_${assetId}`;
  const [messages, setMessages] = usePersistentState<Message[]>(`chat-${assetId}`, []);
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
                  const formattedAsset: Asset = {
                      ...anuncio.metadados,
                      id: anuncio._id,
                      ownerId: anuncio.uidFirebase, // Ensure ownerId is mapped
                      title: anuncio.titulo,
                      description: anuncio.descricao,
                      price: anuncio.price,
                      pricePerCredit: anuncio.price,
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
    
    if (assetId && assetType) {
        getAssetDetails(assetId, assetType);
    } else {
        setAsset(null)
    }
  }, [assetId, assetType]);
  
  if (asset === 'loading') {
    return <div className="flex h-screen w-full items-center justify-center"><Loader2 className="h-10 w-10 animate-spin"/></div>;
  }
  
  if (!asset || !assetType) {
    notFound();
  }

  const assetName = 'title' in asset ? asset.title : `Crédito`;
  const sellerName = ('sellerName' in asset && asset.sellerName) ? asset.sellerName : (('owner' in asset && asset.owner) ? asset.owner : 'Vendedor');
  const sellerAvatar = 'https://picsum.photos/seed/avatar2/40/40';

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    const isGoogleMapsUrl = /^(https?:\/\/)?(www\.)?(google\.com\/maps|maps\.app\.goo\.gl)\/.+/.test(newMessage);
    const messageType = isGoogleMapsUrl ? 'location' : 'text';

    const newMsg: Message = { 
        id: `msg-${Date.now()}`,
        sender: 'me', 
        content: newMessage,
        type: messageType,
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, newMsg]);
    
    try {
        await fetch(`/api/messages`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                chatId: assetId, 
                message: newMessage,
                sender: 'me' // In a real app, send user ID
            }),
        });
        setNewMessage('');
    } catch(error) {
        console.error("Failed to send message:", error);
        toast({ title: "Erro", description: "Não foi possível enviar a mensagem.", variant: "destructive"});
        // Optionally remove the message from local state if it fails to send
        setMessages(prev => prev.filter(m => m.id !== newMsg.id));
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      const fileType = file.type.startsWith('image/') ? 'image' : 'pdf';
      // In a real app, upload the file to Firebase Storage here and get the URL
      const content = fileType === 'image' ? URL.createObjectURL(file) : file.name;
      // addMessage({ content: content, type: fileType });
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
        // addMessage({ content: url, type: 'location' });
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
        <div className="hidden md:block md:col-span-4 lg:col-span-3 h-full">
             <ChatList conversations={conversations} activeChatId={assetId}/>
        </div>
        
        <div className="col-span-1 md:col-span-8 lg:col-span-9 h-full flex flex-col gap-4">
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
                            <Link href={`/negociacao/${assetId}/ajuste-contrato?type=${assetType}`}>
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
                         <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <Paperclip className="h-5 w-5" />
                                    <span className="sr-only">Anexar arquivo</span>
                                </Button>
                            </DropdownMenuTrigger>
                             <DropdownMenuContent>
                                <DropdownMenuItem onClick={() => fileInputRef.current?.click()}>
                                    <Paperclip className="mr-2 h-4 w-4"/>
                                    Imagem ou Documento
                                </DropdownMenuItem>
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
