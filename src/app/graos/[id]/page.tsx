
'use client';

import { useEffect, useState } from 'react';
import { notFound, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronRight, MessageSquare, Loader2, Wheat, Sprout, Package, Forward, Calendar, Shield, MapPin, Percent, Droplet, Archive, Truck, Banknote, FileText } from 'lucide-react';
import type { GrainInsumo, GrainPosColheita, GrainFuturo, Asset } from '@/lib/types';
import { useUser } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

type GrainAsset = GrainInsumo | GrainPosColheita | GrainFuturo;

async function getGrainDetails(id: string): Promise<GrainAsset | null> {
  try {
    const response = await fetch(`/api/anuncios/get/${id}`);
    if (!response.ok) return null;
    
    const data = await response.json();
    if (data.ok && data.anuncio.tipo.startsWith('grain-')) {
        const anuncio = data.anuncio;
        return {
            ...anuncio.metadados,
            id: anuncio._id,
            title: anuncio.titulo,
            ownerId: anuncio.uidFirebase,
            vendedorId: anuncio.uidFirebase,
            price: anuncio.price,
            status: anuncio.status,
            tipo: anuncio.tipo,
            imagens: anuncio.imagens || [],
            createdAt: anuncio.createdAt,
            // Fields that might not exist in metadados but are expected in types
            precoPorSaca: anuncio.price,
            precoFuturo: anuncio.price,
            ...anuncio.metadados
        };
    }
    return null;
  } catch (error) {
    console.error("Failed to fetch grain details", error);
    return null;
  }
}

const DetailItem = ({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value: React.ReactNode }) => (
    <li className="flex items-start gap-4">
        <Icon className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
        <div>
            <p className="font-semibold">{label}</p>
            <p className="text-muted-foreground">{value}</p>
        </div>
    </li>
);

export default function GrainDetailPage({ params }: { params: { id: string } }) {
  const [grain, setGrain] = useState<GrainAsset | null | 'loading'>('loading');
  const [isStartingChat, setIsStartingChat] = useState(false);
  const { user } = useUser();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (params.id) {
        getGrainDetails(params.id).then(setGrain);
    }
  }, [params.id]);

  const handleStartNegotiation = async () => {
    if (!user || !grain || grain === 'loading') {
        toast({ title: "Ação necessária", description: "Faça login para negociar.", variant: "destructive" });
        router.push('/login');
        return;
    }
    setIsStartingChat(true);
    try {
      const response = await fetch('/api/chat/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ buyerId: user.uid, assetId: grain.id }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Não foi possível iniciar o chat.');
      router.push(`/chat-negociacao?id=${data.chatId}`);
    } catch (error: any) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
      setIsStartingChat(false);
    }
  };

  const renderGrainDetails = () => {
    if (!grain || grain === 'loading') return null;
    
    let details: React.ReactNode;
    let price: number | undefined;
    let priceLabel: string;
    
    switch (grain.tipo) {
        case 'grain-insumo':
            price = grain.precoPorSaca;
            priceLabel = 'Preço / saca';
            details = (
                <ul className="space-y-4">
                    <DetailItem icon={Wheat} label="Grão" value={grain.grain} />
                    <DetailItem icon={Sprout} label="Cultivar" value={grain.cultivar} />
                    <DetailItem icon={Percent} label="Germinação" value={`${grain.testes?.germinacao}%`} />
                    {grain.testes?.vigor && <DetailItem icon={Shield} label="Vigor" value={`${grain.testes.vigor}%`} />}
                    <DetailItem icon={Package} label="Quantidade" value={`${grain.quantidadeDisponivel.toLocaleString()} sacas`} />
                </ul>
            );
            break;
        case 'grain-pos-colheita':
            price = grain.precoPorSaca;
            priceLabel = 'Preço / saca';
            details = (
                 <ul className="space-y-4">
                    <DetailItem icon={Wheat} label="Grão" value={grain.grain} />
                    <DetailItem icon={Calendar} label="Safra" value={grain.safra} />
                    {grain.qualidade?.umidade && <DetailItem icon={Droplet} label="Umidade" value={`${grain.qualidade.umidade}%`} />}
                    {grain.qualidade?.avariados && <DetailItem icon={Archive} label="Avariados" value={`${grain.qualidade.avariados}%`} />}
                    <DetailItem icon={Truck} label="Modalidade" value={grain.modalidadeEntrega.tipo} />
                    {grain.modalidadeEntrega.localRetirada && <DetailItem icon={MapPin} label="Local de Retirada" value={grain.modalidadeEntrega.localRetirada} />}
                    <DetailItem icon={Package} label="Quantidade" value={`${grain.quantidadeDisponivel.toLocaleString()} sacas`} />
                </ul>
            );
            break;
        case 'grain-futuro':
            price = grain.precoFuturo;
            priceLabel = 'Preço Futuro / saca';
             details = (
                 <ul className="space-y-4">
                    <DetailItem icon={Wheat} label="Grão" value={grain.grain} />
                    <DetailItem icon={Calendar} label="Safra" value={grain.safra} />
                    <DetailItem icon={Calendar} label="Data de Entrega" value={new Date(grain.dataEntrega).toLocaleDateString('pt-BR')} />
                    <DetailItem icon={FileText} label="Instrumento" value={grain.instrumento.tipo} />
                    <DetailItem icon={Package} label="Quantidade" value={`${grain.quantidade.toLocaleString()} sacas`} />
                    <DetailItem icon={Shield} label="Garantias" value={
                        `${grain.garantias?.seguroRural ? 'Seguro Rural' : ''}
                         ${grain.garantias?.seguroRural && grain.garantias?.alienacaoFiduciaria ? ' + ' : ''}
                         ${grain.garantias?.alienacaoFiduciaria ? 'Alienação Fiduciária' : ''}`
                    } />
                </ul>
            );
            break;
        default:
            return <p>Detalhes indisponíveis para este tipo de grão.</p>;
    }
    return { details, price, priceLabel };
  };

  if (grain === 'loading') return <div className="container mx-auto py-8 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto"/></div>;
  if (!grain) notFound();

  const { details, price, priceLabel } = renderGrainDetails() || {};
  const carouselMedia = grain.imagens && grain.imagens.length > 0 ? grain.imagens : [];

  return (
    <div className="container mx-auto max-w-7xl py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center space-x-2 text-sm text-muted-foreground">
        <Link href="/graos" className="hover:text-primary">Mercado de Grãos</Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground">{grain.title || 'Detalhe do Grão'}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
        <div className="lg:col-span-2 space-y-8">
          <div>
            <div className="flex flex-wrap items-center gap-4 mb-2">
              <h1 className="text-3xl font-bold tracking-tight md:text-4xl font-headline">{grain.title || 'Anúncio de Grãos'}</h1>
              <Badge className="text-base" variant="default">{grain.status}</Badge>
            </div>
            <p className="text-lg text-muted-foreground">Vendido por [Vendedor]</p>
          </div>
          
            <Card>
                <CardContent className="p-4">
                     {carouselMedia.length > 0 ? (
                        <Carousel className="w-full">
                            <CarouselContent>
                                {carouselMedia.map((media, index) => (
                                    <CarouselItem key={index}>
                                        <div className="aspect-video w-full overflow-hidden rounded-lg relative bg-secondary">
                                            <Image src={media.url} alt={media.alt || `Imagem ${index+1}`} fill className="object-cover" />
                                        </div>
                                    </CarouselItem>
                                ))}
                            </CarouselContent>
                            <CarouselPrevious className="ml-16" />
                            <CarouselNext className="mr-16" />
                        </Carousel>
                    ) : (
                         <div className="aspect-video w-full overflow-hidden rounded-lg bg-secondary flex items-center justify-center">
                            <Wheat className="h-24 w-24 text-muted-foreground/30"/>
                        </div>
                    )}
                </CardContent>
            </Card>

          <Card>
            <CardHeader><CardTitle>Detalhes da Oferta</CardTitle></CardHeader>
            <CardContent>{details}</CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle>Negociação</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {price && priceLabel && (
                  <div className="p-4 rounded-md bg-primary/10 border border-primary/20 flex justify-between items-center">
                    <span className="font-semibold text-primary/90">{priceLabel}</span>
                    <span className="text-2xl font-bold text-primary">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price)}
                    </span>
                  </div>
              )}
              <Button onClick={handleStartNegotiation} className="w-full text-base" size="lg" disabled={grain.status !== 'Disponível' || isStartingChat || user?.uid === grain.ownerId}>
                    {isStartingChat ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <MessageSquare className="mr-2 h-5 w-5" />}
                    {user?.uid === grain.ownerId ? 'Este é o seu ativo' : 'Iniciar Negociação'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
