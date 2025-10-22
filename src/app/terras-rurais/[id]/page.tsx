
'use client';

import { useEffect, useState } from 'react';
import { notFound, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronRight, MapPin, MountainIcon, Handshake, Sprout, Building, Pickaxe, User, FileText, Fingerprint, MessageSquare, Film, Loader2 } from 'lucide-react';
import type { RuralLand, Conversation } from '@/lib/types';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { cn } from '@/lib/utils';
import { useUser } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { usePersistentState } from '@/app/chat-negociacao/use-persistent-state';

const BusinessTypeIcon = ({ type, className }: { type: RuralLand['businessType'], className?: string }) => {
    const icons = {
      'Venda': Handshake,
      'Permuta': Building,
      'Mineração': Pickaxe,
      'Arrendamento': Sprout,
    };
    const Icon = icons[type];
    return <Icon className={cn("h-6 w-6 text-primary flex-shrink-0 mt-1", className)} />;
}

const StatusBadge = ({ status }: { status: RuralLand['status'] }) => {
    const variant = {
      'Disponível': 'default',
      'Negociando': 'outline',
      'Vendido': 'secondary',
    }[status] as 'default' | 'outline' | 'secondary';
  
    const className = {
      'Disponível': 'bg-green-100 text-green-800 border-green-200',
      'Negociando': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Vendido': 'bg-gray-100 text-gray-800 border-gray-200',
    }[status];
  
    return <Badge variant={variant} className={cn('capitalize text-base', className)}>{status}</Badge>;
};


async function getLandDetails(id: string): Promise<RuralLand | null> {
  try {
    const response = await fetch(`/api/anuncios/get/${id}`);
    if (!response.ok) {
      return null;
    }
    const data = await response.json();
    if (data.ok && data.anuncio.tipo === 'rural-land') {
        const anuncio = data.anuncio;
        return {
            id: anuncio._id,
            title: anuncio.titulo,
            description: anuncio.descricao,
            owner: anuncio.metadados?.owner || 'Vendedor Anônimo',
            sizeHa: anuncio.metadados?.sizeHa || 0,
            businessType: anuncio.metadados?.businessType || 'Venda',
            location: anuncio.metadados?.location || 'N/A',
            images: anuncio.imagens || [],
            documentation: anuncio.metadados?.documentation || 'N/A',
            registration: anuncio.metadados?.registration || 'N/A',
            price: anuncio.price,
            status: anuncio.status || 'Disponível',
            ownerId: anuncio.uidFirebase,
            createdAt: anuncio.createdAt,
        };
    }
    return null;
  } catch (error) {
    console.error("Failed to fetch land details", error);
    return null;
  }
}

export default function RuralLandDetailPage({ params }: { params: { id: string } }) {
  const [land, setLand] = useState<RuralLand | null | 'loading'>('loading');
  const [isStartingChat, setIsStartingChat] = useState(false);
  const { user } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const [_, setConversations] = usePersistentState<Conversation[]>(
    user ? `conversations_${user.uid}` : 'conversations_guest',
    []
  );

  const handleStartNegotiation = () => {
    if (!user || !land || land === 'loading') {
        toast({ title: "Ação necessária", description: "Por favor, faça login para iniciar uma negociação.", variant: "destructive" });
        router.push('/login');
        return;
    }

    setIsStartingChat(true);

    const conversationKey = `conversations_${user.uid}`;
    const currentConversations: Conversation[] = JSON.parse(localStorage.getItem(conversationKey) || '[]');
    
    const existingConversation = currentConversations.find(c => c.id === land.id);
    if (existingConversation) {
        router.push(`/chat-negociacao?id=${existingConversation.id}`);
        return;
    }
    
    const newConversation: Conversation = {
        id: land.id,
        assetId: land.id,
        assetName: land.title,
        name: land.owner,
        avatar: `https://avatar.vercel.sh/${land.ownerId}.png`,
        lastMessage: 'Negociação iniciada...',
        time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        unread: 0,
        type: 'rural-land',
        participants: [user.uid, land.ownerId],
    };

    const updatedConversations = [newConversation, ...currentConversations];
    localStorage.setItem(conversationKey, JSON.stringify(updatedConversations));
    
    window.dispatchEvent(new Event('storage'));
    setConversations(updatedConversations);

    router.push(`/chat-negociacao?id=${land.id}`);
  };


  useEffect(() => {
    if(params.id) {
        getLandDetails(params.id).then(data => {
            setLand(data);
        });
    }
  }, [params.id]);

  if (land === 'loading') {
    return <div className="container mx-auto py-8 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto"/></div>;
  }
  
  if (!land) {
    notFound();
  }
  
  const getPriceLabel = () => {
    switch (land.businessType) {
      case 'Venda': return 'Preço de Venda';
      case 'Arrendamento': return 'Preço / Ha / Ano';
      case 'Mineração': return 'Valor da Parceria/Venda';
      case 'Permuta': return 'Valor de Referência';
      default: return 'Preço';
    }
  }

  const landDetails = [
    { icon: BusinessTypeIcon, label: 'Tipo de Negócio', value: land.businessType, props: { type: land.businessType, className: "h-6 w-6 text-primary flex-shrink-0 mt-1" } },
    { icon: User, label: 'Proprietário', value: land.owner },
    { icon: MountainIcon, label: 'Área Total', value: `${land.sizeHa.toLocaleString()} Ha` },
    { icon: MapPin, label: 'Localização', value: land.location },
    { icon: Fingerprint, label: 'Inscrição/Matrícula', value: land.registration },
    { icon: FileText, label: 'Documentação', value: land.documentation },
  ];
  
  const carouselMedia = land.images && land.images.length > 0
    ? land.images.map(img => typeof img === 'string' ? { url: img, type: 'image' as const } : img)
    : [{ url: `https://picsum.photos/seed/${land.id}/1200/675`, type: 'image' as const, alt: 'Placeholder Image' }];


  return (
    <div className="container mx-auto max-w-7xl py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center space-x-2 text-sm text-muted-foreground">
        <Link href="/terras-rurais" className="hover:text-primary">Terras Rurais</Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground">{land.title}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
        <div className="lg:col-span-2 space-y-8">
          <div>
            <div className="flex flex-wrap items-center gap-4 mb-2">
              <h1 className="text-3xl font-bold tracking-tight md:text-4xl font-headline">
                {land.title}
              </h1>
              <StatusBadge status={land.status} />
            </div>
            <p className="text-lg text-muted-foreground">Ofertado por {land.owner}</p>
          </div>
          
           <Card>
                <CardContent className="p-4">
                    <Carousel className="w-full">
                        <CarouselContent>
                            {carouselMedia.map((media, index) => (
                                <CarouselItem key={index}>
                                    <div className="aspect-video w-full overflow-hidden rounded-lg relative bg-secondary">
                                        {media.type === 'video' ? (
                                            <video
                                                src={media.url}
                                                controls
                                                className="object-contain w-full h-full"
                                            />
                                        ) : (
                                            <Image
                                                src={media.url}
                                                alt={media.alt || `Mídia ${index + 1} de ${land.title}`}
                                                fill
                                                className="object-cover"
                                                data-ai-hint="fazenda"
                                            />
                                        )}
                                         {media.type === 'video' && <Film className="h-6 w-6 text-white absolute top-3 left-3 drop-shadow-lg" />}
                                    </div>
                                </CarouselItem>
                            ))}
                        </CarouselContent>
                        <CarouselPrevious className="ml-16" />
                        <CarouselNext className="mr-16" />
                    </Carousel>
                </CardContent>
            </Card>

          <Card>
            <CardHeader><CardTitle>Descrição da Propriedade</CardTitle></CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{land.description}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Detalhes da Terra</CardTitle></CardHeader>
            <CardContent>
              <ul className="space-y-4">
                {landDetails.map((detail, index) => (
                  <li key={index} className="flex items-start gap-4">
                     <detail.icon {...(detail.props as any) || { className: "h-6 w-6 text-primary flex-shrink-0 mt-1" }} />
                    <div>
                      <p className="font-semibold">{detail.label}</p>
                      <p className="text-muted-foreground">{detail.value}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle>Negociação</CardTitle>
              <CardDescription>
                Entre em contato para fazer sua proposta.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                
              {land.price ? (
                <div className="p-4 rounded-md bg-primary/10 border border-primary/20 flex justify-between items-center">
                    <span className="font-semibold text-primary/90">{getPriceLabel()}</span>
                    <span className="text-2xl font-bold text-primary">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(land.price)}
                    </span>
                </div>
              ) : (
                <div className="p-4 rounded-md bg-secondary/50 border flex justify-center items-center">
                    <span className="text-xl font-bold text-secondary-foreground">
                        Aberto a Propostas
                    </span>
                </div>
              )}
             
              <div className="space-y-3 pt-4">
                 <Button onClick={handleStartNegotiation} className="w-full text-base" size="lg" disabled={land.status !== 'Disponível' || isStartingChat || user?.uid === land.ownerId}>
                    {isStartingChat ? (
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    ) : (
                        <MessageSquare className="mr-2 h-5 w-5" />
                    )}
                    {user?.uid === land.ownerId ? 'Este é o seu ativo' : 'Iniciar Negociação'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
