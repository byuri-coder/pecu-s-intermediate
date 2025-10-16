'use client';

import React, { useState, useEffect, useCallback } from 'react';
import type { RuralLand } from '@/lib/types';
import { RuralLandCard } from '@/components/rural-land-card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Filter, Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';

const PAGE_SIZE = 8;

export default function RuralLandsMarketplacePage() {
  const [lands, setLands] = useState<RuralLand[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchLands = useCallback(async (isLoadMore = false) => {
    const currentPage = isLoadMore ? page : 1;
    if (isLoadMore) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }
    
    try {
      const response = await fetch(`/api/anuncios/list?page=${currentPage}&limit=${PAGE_SIZE}&tipo=rural-land`);
      if (!response.ok) {
        throw new Error('Failed to fetch rural lands');
      }
      const data = await response.json();

      const formattedLands = data.anuncios.map((anuncio: any) => ({
        id: anuncio._id,
        title: anuncio.titulo,
        description: anuncio.descricao,
        owner: anuncio.metadados?.owner || 'Vendedor Anônimo',
        sizeHa: anuncio.metadados?.sizeHa || 0,
        businessType: anuncio.metadados?.businessType || 'Venda',
        location: anuncio.metadados?.location || 'N/A',
        images: anuncio.imagens?.map((img: any) => img.url) || [],
        documentation: anuncio.metadados?.documentation || 'N/A',
        registration: anuncio.metadados?.registration || 'N/A',
        price: anuncio.price,
        status: anuncio.status || 'Disponível',
        ownerId: anuncio.uidFirebase,
        createdAt: anuncio.createdAt,
      }));

      if (data.anuncios.length < PAGE_SIZE) {
        setHasMore(false);
      } else {
        setHasMore(true);
      }
      
      setLands(prev => isLoadMore ? [...prev, ...formattedLands] : formattedLands);
       if (isLoadMore) {
        setPage(currentPage + 1);
      } else {
        setPage(2);
      }
    } catch (error) {
      console.error("Error fetching rural lands: ", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [page]);

  useEffect(() => {
    fetchLands(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const availableLands = lands.filter(c => c.status === 'Disponível' || c.status === 'Negociando');

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <section className="text-center mb-12">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl font-headline">
          Marketplace de Terras Rurais
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
          Encontre a propriedade rural ideal para o seu negócio.
        </p>
      </section>

      <section className="mb-8">
        <div className="p-4 rounded-lg border bg-card shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo de Negócio</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="venda">Venda</SelectItem>
                  <SelectItem value="arrendamento">Arrendamento</SelectItem>
                  <SelectItem value="permuta">Permuta</SelectItem>
                  <SelectItem value="mineracao">Mineração</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Tamanho Mínimo (Ha)</label>
              <Input type="number" placeholder="Ex: 500" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Localização</label>
              <Input placeholder="Ex: Bahia, Brasil" />
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
                    <Skeleton className="h-40 w-full" />
                    <CardHeader><Skeleton className="h-4 w-3/4" /></CardHeader>
                    <CardContent className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-5/6" />
                    </CardContent>
                    <CardFooter><Skeleton className="h-10 w-full" /></CardFooter>
                </Card>
            ))}
          </div>
        ) : availableLands.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {availableLands.map((land) => (
                <RuralLandCard key={land.id} land={land} />
              ))}
            </div>
            {hasMore && (
              <div className="mt-8 flex justify-center">
                <Button onClick={() => fetchLands(true)} disabled={loadingMore}>
                  {loadingMore ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Carregar Mais'}
                </Button>
              </div>
            )}
          </>
        ) : (
           <div className="col-span-full text-center py-12 text-muted-foreground">
              <p>Nenhuma terra rural disponível no momento.</p>
            </div>
        )}
      </section>
    </div>
  );
}
