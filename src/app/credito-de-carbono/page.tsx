'use client';

import React, { useState, useEffect, useCallback } from 'react';
import type { CarbonCredit } from '@/lib/types';
import { CreditCard as CreditCardComponent } from '@/components/credit-card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Filter, Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';

const PAGE_SIZE = 8;

export default function MarketplacePage() {
  const [credits, setCredits] = useState<CarbonCredit[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchCredits = useCallback(async (isLoadMore = false) => {
    const currentPage = isLoadMore ? page : 1;
    if (isLoadMore) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }

    try {
      const response = await fetch(`/api/anuncios/list?page=${currentPage}&limit=${PAGE_SIZE}&tipo=carbon-credit`);
      if (!response.ok) {
        throw new Error('Failed to fetch credits');
      }
      const data = await response.json();
      
      if (data.anuncios.length < PAGE_SIZE) {
        setHasMore(false);
      } else {
        setHasMore(true);
      }

      setCredits(prev => isLoadMore ? [...prev, ...data.anuncios] : data.anuncios);
      if (isLoadMore) {
        setPage(currentPage + 1);
      } else {
        setPage(2);
      }
      
    } catch (error) {
      console.error("Error fetching carbon credits: ", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [page]);


  useEffect(() => {
    fetchCredits(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <section className="text-center mb-12">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl font-headline">
          Crédito de Carbono
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
          Explore, negocie e invista em um futuro mais verde.
        </p>
      </section>

      <section className="mb-8">
        <div className="p-4 rounded-lg border bg-card shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo de Crédito</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="forestry">Forestry</SelectItem>
                  <SelectItem value="renewable">Renewable Energy</SelectItem>
                  <SelectItem value="waste">Waste Management</SelectItem>
                  <SelectItem value="agriculture">Agriculture</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Faixa de Preço</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Qualquer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Qualquer</SelectItem>
                  <SelectItem value="low">Até R$20</SelectItem>
                  <SelectItem value="medium">R$20 - R$50</SelectItem>
                  <SelectItem value="high">Acima de R$50</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Localização</label>
              <Input placeholder="Ex: Bahia, Brasil" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Quantidade Mínima</label>
              <Input type="number" placeholder="1000" />
            </div>
            <Button className="w-full">
              <Filter className="mr-2 h-4 w-4" /> Filtrar
            </Button>
          </div>
        </div>
      </section>
      
      <section>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
                <Card key={i}>
                    <CardHeader><Skeleton className="h-4 w-3/4" /></CardHeader>
                    <CardContent className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-5/6" />
                    </CardContent>
                    <CardFooter><Skeleton className="h-10 w-full" /></CardFooter>
                </Card>
            ))}
          </div>
        ) : credits.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {credits.map((credit) => (
                <CreditCardComponent key={credit.id} credit={credit} />
              ))}
            </div>
             {hasMore && (
              <div className="mt-8 flex justify-center">
                <Button onClick={() => fetchCredits(true)} disabled={loadingMore}>
                  {loadingMore ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Carregar Mais'}
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <p>Nenhum crédito de carbono disponível no momento.</p>
          </div>
        )}
      </section>
    </div>
  );
}
