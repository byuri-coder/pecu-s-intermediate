
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import type { Asset } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Filter, Loader2, Wheat } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { GrainCard } from '@/components/grain-card';

const PAGE_SIZE = 12;

export default function GrainsMarketplacePage() {
  const [grains, setGrains] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchGrains = useCallback(async (isLoadMore = false) => {
    const currentPage = isLoadMore ? page : 1;
    if (isLoadMore) {
      setLoadingMore(true);
    } else {
      setLoading(true);
      setGrains([]); // Clear previous results for a new filter/initial load
    }
    
    try {
      const grainTypes = ['grain-insumo', 'grain-pos-colheita', 'grain-futuro'];
      
      const requests = grainTypes.map(type => 
        fetch(`/api/anuncios/list?page=${currentPage}&limit=${PAGE_SIZE / grainTypes.length}&tipo=${type}`)
      );
      
      const responses = await Promise.all(requests);
      
      let allNewGrains: Asset[] = [];
      let stillHasMore = false;

      for (const response of responses) {
          if (!response.ok) {
            console.error('Failed to fetch grains for a type', response.statusText);
            continue;
          }
          const data = await response.json();
          if (data.ok) {
            const formattedGrains = data.anuncios.map((anuncio: any) => ({
              ...anuncio.metadados,
              id: anuncio._id,
              title: anuncio.titulo,
              description: anuncio.descricao,
              price: anuncio.price,
              status: anuncio.status,
              ownerId: anuncio.uidFirebase,
              createdAt: anuncio.createdAt,
              tipo: anuncio.tipo,
              imagens: anuncio.imagens,
            }));
            allNewGrains = allNewGrains.concat(formattedGrains);
            if (data.anuncios.length >= (PAGE_SIZE / grainTypes.length)) {
                stillHasMore = true;
            }
          }
      }
      
      setHasMore(stillHasMore);
      setGrains(prev => isLoadMore ? [...prev, ...allNewGrains] : allNewGrains);

       if (isLoadMore) {
        setPage(currentPage + 1);
      } else {
        setPage(2); // Set up the next page to be loaded
      }

    } catch (error) {
      console.error("Error fetching grains: ", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [page]);

  useEffect(() => {
    fetchGrains(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const availableGrains = grains.filter(g => g.status === 'Disponível');

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <section className="text-center mb-12">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl font-headline flex items-center justify-center gap-4">
          <Wheat className="h-10 w-10"/> Mercado de Grãos
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
          Negocie insumos, grãos físicos e contratos futuros com segurança e eficiência.
        </p>
      </section>

      <section className="mb-8">
        <div className="p-4 rounded-lg border bg-card shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
             <div className="space-y-2">
              <label className="text-sm font-medium">Categoria</label>
              <Select>
                <SelectTrigger><SelectValue placeholder="Todas" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="insumo">Insumos (Sementes)</SelectItem>
                  <SelectItem value="pos-colheita">Pós-Colheita</SelectItem>
                  <SelectItem value="futuro">Venda Futura (CPR)</SelectItem>
                </SelectContent>
              </Select>
            </div>
             <div className="space-y-2">
              <label className="text-sm font-medium">Tipo de Grão</label>
              <Input placeholder="Soja, Milho..." />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Safra</label>
              <Input placeholder="Ex: 23/24" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Localização</label>
              <Input placeholder="Ex: Sorriso, MT" />
            </div>
            <Button className="w-full">
              <Filter className="mr-2 h-4 w-4" /> Filtrar
            </Button>
          </div>
        </div>
      </section>
      
      <section>
         {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
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
        ) : availableGrains.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableGrains.map((grain) => (
                <GrainCard key={grain.id} grain={grain as any} />
              ))}
            </div>
            {hasMore && (
              <div className="mt-8 flex justify-center">
                <Button onClick={() => fetchGrains(true)} disabled={loadingMore}>
                  {loadingMore ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Carregar Mais'}
                </Button>
              </div>
            )}
          </>
        ) : (
           <div className="col-span-full text-center py-12 text-muted-foreground">
              <p>Nenhum anúncio de grãos disponível no momento.</p>
            </div>
        )}
      </section>
    </div>
  );
}
