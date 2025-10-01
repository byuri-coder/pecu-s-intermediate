import { placeholderTaxCredits } from '@/lib/placeholder-data';
import { TaxCreditCard } from '@/components/tax-credit-card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Filter } from 'lucide-react';

export default function TaxCreditsMarketplacePage() {
  const availableCredits = placeholderTaxCredits.filter(
    c => (c.status === 'Disponível' || c.status === 'Negociando') &&
         c.taxType === 'ICMS' &&
         c.location.includes('SP')
  );

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <section className="text-center mb-12">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl font-headline">
          Marketplace de Créditos de ICMS (SP)
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
          Otimize sua carga fiscal negociando saldos credores de ICMS acumulado do estado de São Paulo.
        </p>
      </section>

      <section className="mb-8">
        <div className="p-4 rounded-lg border bg-card shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
            <div className="space-y-2">
              <label className="text-sm font-medium">Valor do Crédito</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Qualquer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Qualquer</SelectItem>
                  <SelectItem value="low">Até R$50.000</SelectItem>
                  <SelectItem value="medium">R$50.000 - R$200.000</SelectItem>
                  <SelectItem value="high">Acima de R$200.000</SelectItem>
                </SelectContent>
              </Select>
            </div>
             <Button className="w-full">
                <Filter className="mr-2 h-4 w-4" /> Filtrar
            </Button>
          </div>
        </div>
      </section>
      
      <section>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {availableCredits.map((credit) => (
            <TaxCreditCard key={credit.id} credit={credit} />
          ))}
           {availableCredits.length === 0 && (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              <p>Nenhum crédito de ICMS de São Paulo disponível no momento.</p>
            </div>
           )}
        </div>
      </section>
    </div>
  );
}
