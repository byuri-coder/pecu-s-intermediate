import { placeholderCredits } from '@/lib/placeholder-data';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '../../../components/ui/button';
import { ChevronRight, Leaf, Tag, BarChart, Calendar, Globe, MessageSquare } from 'lucide-react';

export default function CreditDetailPage({ params }: { params: { id: string } }) {
  const credit = placeholderCredits.find((p) => p.id === params.id);

  if (!credit) {
    notFound();
  }

  const creditDetails = [
    { icon: Leaf, label: 'Tipo de Crédito', value: credit.creditType },
    { icon: BarChart, label: 'Quantidade Disponível', value: credit.quantity.toLocaleString() },
    { icon: Calendar, label: 'Vintage (Ano)', value: credit.vintage },
    { icon: Tag, label: 'Padrão (Standard)', value: credit.standard },
    { icon: Globe, label: 'Localização', value: credit.location },
  ];

  return (
    <div className="container mx-auto max-w-7xl py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center space-x-2 text-sm text-muted-foreground">
        <Link href="/credito-de-carbono" className="hover:text-primary">Crédito de Carbono</Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground">{credit.sellerName} - {credit.creditType}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
        <div className="lg:col-span-2 space-y-8">
          <div>
            <div className="flex flex-wrap items-center gap-4 mb-2">
              <h1 className="text-3xl font-bold tracking-tight md:text-4xl font-headline">
                Projeto de {credit.creditType} em {credit.location}
              </h1>
              <Badge className="text-base" variant="default">Créditos Disponíveis</Badge>
            </div>
            <p className="text-lg text-muted-foreground">Vendido por {credit.sellerName}</p>
          </div>
          
          <Card>
            <CardContent className="p-0">
                <div className="aspect-video w-full overflow-hidden rounded-t-lg">
                    <Image
                        src={`https://picsum.photos/seed/${credit.id}/1200/675`}
                        alt={`Imagem do projeto ${credit.id}`}
                        width={1200}
                        height={675}
                        className="object-cover w-full h-full"
                        data-ai-hint="nature landscape"
                    />
                </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Visão Geral do Projeto</CardTitle></CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{credit.projectOverview}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Detalhes do Crédito</CardTitle></CardHeader>
            <CardContent>
              <ul className="space-y-4">
                {creditDetails.map((detail, index) => (
                  <li key={index} className="flex items-start gap-4">
                    <detail.icon className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
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
              <CardTitle>Interessado?</CardTitle>
              <CardDescription>
                Inicie uma conversa para negociar este ativo.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 rounded-md bg-secondary/50 border flex justify-between items-center">
                <span className="font-semibold text-secondary-foreground">Preço por Crédito</span>
                <span className="text-2xl font-bold text-primary">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(credit.pricePerCredit)}
                </span>
              </div>
              <Button asChild className="w-full text-base" size="lg">
                  <Link href={`/negociacao/${credit.id}?type=carbon-credit`}>
                    <MessageSquare className="mr-2 h-5 w-5" />
                    Iniciar Negociação
                  </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
export async function generateStaticParams() {
  // Como 'placeholderCredits' já está disponível e contém todos os créditos
  // podemos usá-lo diretamente para obter todos os IDs.
  return placeholderCredits.map((credit) => ({
    id: credit.id,
  }));
}
