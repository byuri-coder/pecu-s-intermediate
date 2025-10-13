'use client';

import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { CarbonCredit } from '@/lib/types';
import { CreditCard } from '@/components/credit-card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Filter, Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';

export default function MarketplacePage() {
  const [allCredits, setAllCredits] = useState<CarbonCredit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCredits = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "carbon-credits"));
        const credits: CarbonCredit[] = [];
        querySnapshot.forEach((doc) => {
          credits.push({ id: doc.id, ...doc.data() } as CarbonCredit);
        });
        setAllCredits(credits);
      } catch (error) {
        console.error("Error fetching carbon credits: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCredits();
  }, []);
  
  const activeCredits = allCredits.filter(c => c.status === 'Ativo' || c.status === 'Disponível');


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
            {[...Array(4)].map((_, i) => (
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
        ) : activeCredits.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {activeCredits.map((credit) => (
              <CreditCard key={credit.id} credit={credit} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <p>Nenhum crédito de carbono disponível no momento.</p>
          </div>
        )}
      </section>
    </div>
  );
}
