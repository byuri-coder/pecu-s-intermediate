import { placeholderRuralLands } from '@/lib/placeholder-data';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronRight, MapPin, MountainIcon, Handshake, Sprout, Building, Pickaxe, User, FileText, Fingerprint, MessageSquare } from 'lucide-react';
import type { RuralLand } from '@/lib/types';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { cn } from '@/lib/utils';


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


export default function RuralLandDetailPage({ params }: { params: { id: string } }) {
  const land = placeholderRuralLands.find((p) => p.id === params.id);

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

  const carouselImages = Array.from({ length: 3 }, (_, i) => ({
    src: `https://picsum.photos/seed/${land.id}${i + 1}/1200/675`,
    alt: `Imagem ${i + 1} de ${land.title}`,
  }));


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
                            {carouselImages.map((image, index) => (
                                <CarouselItem key={index}>
                                    <div className="aspect-video w-full overflow-hidden rounded-lg relative">
                                        <Image
                                            src={image.src}
                                            alt={image.alt}
                                            fill
                                            className="object-cover"
                                            data-ai-hint="fazenda"
                                        />
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
                 <Button asChild className="w-full text-base" size="lg" disabled={land.status !== 'Disponível'}>
                  <Link href={`/negociacao/${land.id}?type=rural-land`}>
                    <MessageSquare className="mr-2 h-5 w-5" />
                    Iniciar Negociação
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
export async function generateStaticParams() {
  return placeholderRuralLands.map((ruralLand) => ({
    id: ruralLand.id,
  }));
}
