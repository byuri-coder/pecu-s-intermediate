'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { collection, getDocs, query, orderBy, limit, startAfter, DocumentData } from 'firebase/firestore';
import { db } from '@/lib/firebase';
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
  const [lastVisible, setLastVisible] = useState<DocumentData | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const fetchLands = useCallback(async (loadMore = false) => {
    if (loadMore) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }
    
    try {
      let q = query(
        collection(db, "rural-lands"),
        orderBy("createdAt", "desc"),
        limit(PAGE_SIZE)
      );

      if (loadMore && lastVisible) {
        q = query(
          collection(db, "rural-lands"),
          orderBy("createdAt", "desc"),
          startAfter(lastVisible),
          limit(PAGE_SIZE)
        );
      }
      
      const querySnapshot = await getDocs(q);
      const newLands: RuralLand[] = [];
      querySnapshot.forEach((doc) => {
        newLands.push({ id: doc.id, ...doc.data() } as RuralLand);
      });
      
      const newLastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];
      setLastVisible(newLastVisible);
      
      if(querySnapshot.docs.length < PAGE_SIZE) {
        setHasMore(false);
      }

      setLands(prev => loadMore ? [...prev, ...newLands] : newLands);
    } catch (error) {
      console.error("Error fetching rural lands: ", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [lastVisible]);

  useEffect(() => {
    fetchLands(false);
  }, []); // initial fetch

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
