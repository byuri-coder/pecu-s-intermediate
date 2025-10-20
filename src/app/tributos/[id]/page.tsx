'use client';

import { useEffect, useState } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronRight, Landmark, MapPin, Building, MessageSquare, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TaxCredit } from '@/lib/types';


const StatusBadge = ({ status }: { status: 'Disponível' | 'Negociando' | 'Vendido' }) => {
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

  return <Badge variant={variant} className={cn('capitalize', className)}>{status}</Badge>;
};

async function getCreditDetails(id: string): Promise<TaxCredit | null> {
  try {
    const response = await fetch(`/api/anuncios/get/${id}`);
    if (!response.ok) {
      return null;
    }
    const data = await response.json();
    if (data.ok && data.anuncio.tipo === 'tax-credit') {
        const anuncio = data.anuncio;
        return {
            id: anuncio._id,
            sellerName: anuncio.metadados?.sellerName || 'Vendedor Anônimo',
            taxType: anuncio.metadados?.taxType || 'N/A',
            amount: anuncio.metadados?.amount || 0,
            price: anuncio.price || 0,
            location: anuncio.metadados?.location || 'N/A',
            status: anuncio.status || 'Disponível',
            ownerId: anuncio.uidFirebase,
            createdAt: anuncio.createdAt,
        };
    }
    return null;
  } catch (error) {
    console.error("Failed to fetch tax credit details", error);
    return null;
  }
}

export default function TaxCreditDetailPage({ params }: { params: { id: string } }) {
  const [credit, setCredit] = useState<TaxCredit | null | 'loading'>('loading');

  useEffect(() => {
    if(params.id) {
        getCreditDetails(params.id).then(data => {
            setCredit(data);
        });
    }
  }, [params.id]);

  if (credit === 'loading') {
    return <div className="container mx-auto py-8 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto"/></div>;
  }

  if (!credit) {
    notFound();
  }

  const discount = ((credit.amount - credit.price) / credit.amount) * 100;

  const creditDetails = [
    { icon: Landmark, label: 'Tipo de Tributo', value: credit.taxType },
    { icon: Building, label: 'Vendedor', value: credit.sellerName },
    { icon: MapPin, label: 'Localização', value: credit.location },
  ];

  return (
    <div className="container mx-auto max-w-7xl py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center space-x-2 text-sm text-muted-foreground">
        <Link href="/tributos" className="hover:text-primary">Créditos Tributários</Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground">{credit.taxType} - {credit.sellerName}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
        <div className="lg:col-span-2 space-y-8">
          <div>
            <div className="flex flex-wrap items-center gap-4 mb-2">
              <h1 className="text-3xl font-bold tracking-tight md:text-4xl font-headline">
                Saldo Credor de {credit.taxType}
              </h1>
              <StatusBadge status={credit.status} />
            </div>
            <p className="text-lg text-muted-foreground">Ofertado por {credit.sellerName}</p>
          </div>
          
          <Card>
            <CardHeader><CardTitle>Resumo da Oportunidade</CardTitle></CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Oportunidade de adquirir um saldo credor de {credit.taxType} no valor de {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(credit.amount)} por um preço reduzido. Ideal para empresas que buscam otimização tributária e melhora no fluxo de caixa.
              </p>
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
              <CardTitle>Negociação</CardTitle>
              <CardDescription>
                Entre em contato para adquirir o saldo credor.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 rounded-md bg-secondary/50 border flex flex-col gap-2">
                  <div className="flex justify-between items-center text-sm">
                      <span className="font-semibold text-secondary-foreground">Valor do Crédito</span>
                      <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(credit.amount)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                      <span className="font-semibold text-secondary-foreground">Deságio</span>
                      <span>{discount.toFixed(2)}%</span>
                  </div>
              </div>

               <div className="p-4 rounded-md bg-primary/10 border border-primary/20 flex justify-between items-center">
                <span className="font-semibold text-primary/90">Preço de Venda</span>
                <span className="text-2xl font-bold text-primary">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(credit.price)}
                </span>
              </div>

              <div className="space-y-3 pt-4">
                <Button asChild className="w-full text-base" size="lg" disabled={credit.status !== 'Disponível'}>
                  <Link href={`/negociacao/${credit.id}?type=tax-credit`}>
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
