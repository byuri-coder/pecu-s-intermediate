'use client';

import React, { useState, useEffect } from 'react';
import { placeholderCredits } from '@/lib/placeholder-data';
import type { CarbonCredit } from '@/lib/types';
import { CreditCard } from '@/components/credit-card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Filter } from 'lucide-react';

export default function MarketplacePage() {
  const [allCredits, setAllCredits] = useState<CarbonCredit[]>([]);

  useEffect(() => {
    // This effect runs only on the client-side
    const localCredits: CarbonCredit[] = JSON.parse(localStorage.getItem('carbon_credits') || '[]');
    // Combine placeholder data with locally stored data, avoiding duplicates
    const combined = [...localCredits, ...placeholderCredits.filter(p => !localCredits.some(l => l.id === p.id))];
    setAllCredits(combined);
  }, []);

  const activeCredits = allCredits.filter(c => c.status === 'Ativo');

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {activeCredits.map((credit) => (
            <CreditCard key={credit.id} credit={credit} />
          ))}
        </div>
      </section>
    </div>
  );
}
