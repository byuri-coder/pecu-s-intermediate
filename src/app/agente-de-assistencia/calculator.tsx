'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BadgePercent } from 'lucide-react';

export function TaxCalculator() {
  const [creditAmount, setCreditAmount] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [result, setResult] = useState<{ discountValue: number; discountPercentage: number } | null>(null);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  }

  const handleCalculate = () => {
    const amount = parseFloat(creditAmount);
    const price = parseFloat(sellingPrice);

    if (!isNaN(amount) && !isNaN(price) && amount > 0 && price > 0 && price <= amount) {
      const discountValue = amount - price;
      const discountPercentage = (discountValue / amount) * 100;
      setResult({ discountValue, discountPercentage });
    } else {
      setResult(null);
      // Maybe show a toast message for invalid input
    }
  };

  return (
    <Card className="shadow-lg">
      <CardContent className="p-6 space-y-6">
        <div className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="creditAmount">Valor de Face do Crédito (R$)</Label>
                <Input
                    id="creditAmount"
                    type="number"
                    placeholder="Ex: 100000"
                    value={creditAmount}
                    onChange={(e) => setCreditAmount(e.target.value)}
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="sellingPrice">Preço de Venda (R$)</Label>
                <Input
                    id="sellingPrice"
                    type="number"
                    placeholder="Ex: 95000"
                    value={sellingPrice}
                    onChange={(e) => setSellingPrice(e.target.value)}
                />
            </div>
        </div>
        <Button onClick={handleCalculate} className="w-full">
            Calcular Deságio
        </Button>
        {result && (
          <Card className="bg-secondary/30 border-primary/20">
            <CardHeader className="p-4">
              <CardTitle className="text-lg text-center">Resultado do Cálculo</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-3">
                <div className="flex justify-between items-center bg-background p-3 rounded-md">
                    <span className="text-muted-foreground">Valor do Deságio</span>
                    <span className="font-bold text-primary text-lg">{formatCurrency(result.discountValue)}</span>
                </div>
                 <div className="flex justify-between items-center bg-background p-3 rounded-md">
                    <span className="text-muted-foreground">Percentual de Deságio</span>
                    <span className="font-bold text-primary text-lg flex items-center gap-1">
                        <BadgePercent className="h-5 w-5"/>
                        {result.discountPercentage.toFixed(2)}%
                    </span>
                </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}
