

'use client';

import * as React from 'react';
import { notFound, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Landmark, Handshake, ThumbsUp, ThumbsDown, Edit, FileSignature, Upload, Download, Paperclip, Send, FileText, ShieldCheck, UserCircle, MapPin, LocateFixed, Map, Loader2 } from 'lucide-react';
import { NegotiationChat, type Message } from './negotiation-chat';
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


type AssetType = 'carbon-credit' | 'tax-credit' | 'rural-land';
type Asset = CarbonCredit | RuralLand | TaxCredit;

// Custom hook for persisting state to localStorage
function usePersistentState<T>(key: string, initialState: T): [T, React.Dispatch<React.SetStateAction<T>>] {
    const [state, setState] = React.useState<T>(() => {
        if (typeof window === 'undefined') {
            return initialState;
        }
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialState;
        } catch (error) {
            console.error(`Error reading localStorage key “${key}”:`, error);
            return initialState;
        }
    });

    React.useEffect(() => {
        try {
            window.localStorage.setItem(key, JSON.stringify(state));
        } catch (error) {
            console.error(`Error setting localStorage key “${key}”:`, error);
        }
    }, [key, state]);

    return [state, setState];
}


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
  const searchParams = useSearchParams();
  const assetType = (searchParams.get('type') as AssetType) || 'carbon-credit';
  const { toast } = useToast();

  const [asset, setAsset] = React.useState<Asset | null | 'loading'>('loading');
  
  const negotiationId = `neg_${params.id}`;
  const [messages, setMessages] = usePersistentState<Message[]>(`${negotiationId}_messages`, []);
  const [newMessage, setNewMessage] = React.useState('');
  const [conversations, setConversations] = usePersistentState<Conversation[]>('conversations', []);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    async function getAssetDetails(id: string) {
        try {
            const res = await fetch(`/api/anuncios/get/${id}`);
            if (!res.ok) {
                setAsset(null);
                return;
            }
            const data = await res.json();
            if (data.ok) {
                const anuncio = data.anuncio;
                const formattedAsset = {
                    ...anuncio,
                    id: anuncio._id,
                    ...anuncio.metadados,
                    // Ensure price is handled correctly
                    price: anuncio.price,
                };
                setAsset(formattedAsset as Asset);
            } else {
                setAsset(null);
            }
        } catch(err) {
            console.error("Failed to fetch asset", err);
            setAsset(null);
        }
    }
    
    if (params.id) {
        getAssetDetails(params.id);
    }
  }, [params.id]);
  

  if (asset === 'loading') {
    return <div className="flex h-screen w-full items-center justify-center"><Loader2 className="h-10 w-10 animate-spin"/></div>;
  }
  
  if (!asset) {
    notFound();
  }

  const assetName = 'title' in asset ? asset.title : `Crédito de ${'taxType' in asset ? asset.taxType : 'creditType' in asset ? asset.creditType : ''}`;
  const sellerName = 'owner' in asset ? asset.owner : ('sellerName' in asset ? asset.sellerName : 'Vendedor Desconhecido');
  const isTaxCredit = assetType === 'tax-credit';
  const sellerAvatar = 'https://picsum.photos/seed/avatar2/40/40';

  const addMessage = (msg: Omit<Message, 'id' | 'timestamp' | 'avatar' | 'sender'>) => {
    const now = new Date();
    const finalMessage: Message = {
      id: String(Date.now()),
      sender: 'me',
      timestamp: `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`,
      avatar: 'https://picsum.photos/seed/avatar1/40/40',
      ...msg
    };
    
    setMessages(prev => [...prev, finalMessage]);

    // Check if it's the first message to create a conversation
    const newConversation: Conversation = {
        id: params.id,
        name: sellerName,
        avatar: sellerAvatar,
        lastMessage: finalMessage.type === 'text' ? finalMessage.content : `Anexo: ${finalMessage.type}`,
        time: finalMessage.timestamp,
        unread: 0,
        type: assetType,
    };
    
    setConversations(prevConvos => {
        const existing = prevConvos.find(c => c.id === newConversation.id);
        if (existing) {
            return prevConvos.map(c => c.id === newConversation.id ? {...c, lastMessage: newConversation.lastMessage, time: newConversation.time } : c);
        }
        return [newConversation, ...prevConvos];
    })
  }

  const handleSendMessage = () => {
    const messageContent = newMessage.trim();
    if (messageContent === '') return;

    // Check if the message is a Google Maps URL
    const isGoogleMapsUrl = /^(https?:\/\/)?(www\.)?(google\.com\/maps|maps\.app\.goo\.gl)\/.+/.test(messageContent);
    const messageType = isGoogleMapsUrl ? 'location' : 'text';

    addMessage({ content: messageContent, type: messageType });
    setNewMessage('');
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      const fileType = file.type.startsWith('image/') ? 'image' : 'pdf';
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

                                {isTaxCredit && (
                                     <Card>
                                        <CardHeader>
                                            <CardTitle>Documentos do Ativo</CardTitle>
                                            <CardDescription>Acesse os arquivos comprobatórios.</CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                            <div className="flex items-center justify-between p-3 rounded-md border bg-secondary/30">
                                                <div className="flex items-center gap-3">
                                                    <ShieldCheck className="h-6 w-6 text-primary"/>
                                                    <div>
                                                        <p className="font-semibold text-sm">Certidão Negativa de Débitos</p>
                                                        <p className="text-xs text-muted-foreground">cnd_2024.pdf</p>
                                                    </div>
                                                </div>
                                                <Button variant="outline" size="icon">
                                                    <Download className="h-4 w-4"/>
                                                </Button>
                                            </div>
                                            <div className="flex items-center justify-between p-3 rounded-md border bg-secondary/30">
                                                <div className="flex items-center gap-3">
                                                    <FileText className="h-6 w-6 text-primary"/>
                                                    <div>
                                                        <p className="font-semibold text-sm">Documentos Comprobatórios</p>
                                                        <p className="text-xs text-muted-foreground">docs.zip</p>
                                                    </div>
                                                </div>
                                                <Button variant="outline" size="icon">
                                                    <Download className="h-4 w-4"/>
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}
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
