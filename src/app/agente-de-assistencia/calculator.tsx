
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BadgePercent, Minus, Plus } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

// Helper to format currency
const formatCurrency = (value: number) => {
    if (isNaN(value)) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

// 1. Calculadora de Deságio
export function DiscountCalculator() {
  const [creditAmount, setCreditAmount] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [result, setResult] = useState<{ discountValue: number; discountPercentage: number } | null>(null);

  const handleCalculate = () => {
    const amount = parseFloat(creditAmount);
    const price = parseFloat(sellingPrice);

    if (!isNaN(amount) && !isNaN(price) && amount > 0 && price > 0 && price <= amount) {
      const discountValue = amount - price;
      const discountPercentage = (discountValue / amount) * 100;
      setResult({ discountValue, discountPercentage });
    } else {
      setResult(null);
      alert("Por favor, insira valores válidos. O preço de venda não pode ser maior que o valor de face.");
    }
  };

  return (
    <div className="space-y-6">
        <div className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="creditAmount">Valor de Face do Crédito (R$)</Label>
                <Input id="creditAmount" type="number" placeholder="Ex: 100000" value={creditAmount} onChange={(e) => setCreditAmount(e.target.value)} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="sellingPrice">Preço de Venda (R$)</Label>
                <Input id="sellingPrice" type="number" placeholder="Ex: 95000" value={sellingPrice} onChange={(e) => setSellingPrice(e.target.value)} />
            </div>
        </div>
        <Button onClick={handleCalculate} className="w-full">Calcular Deságio</Button>
        {result && (
          <Card className="bg-secondary/30 border-primary/20">
            <CardHeader className="p-4"><CardTitle className="text-lg text-center">Resultado do Cálculo</CardTitle></CardHeader>
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
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1">
                    <AccordionTrigger className="text-sm">Ver Detalhes do Cálculo</AccordionTrigger>
                    <AccordionContent className="space-y-3 text-sm p-2 bg-background rounded-md">
                      <div>
                        <p className="font-semibold">Fórmula do Deságio:</p>
                        <code className="text-xs p-2 bg-muted rounded-md block mt-1">Valor do Deságio = Valor de Face - Preço de Venda</code>
                      </div>
                      <div>
                        <p className="font-semibold">Cálculo Aplicado:</p>
                        <code className="text-xs p-2 bg-muted rounded-md block mt-1">{formatCurrency(result.discountValue)} = {formatCurrency(parseFloat(creditAmount))} - {formatCurrency(parseFloat(sellingPrice))}</code>
                      </div>
                      <hr/>
                       <div>
                        <p className="font-semibold">Fórmula do Percentual:</p>
                        <code className="text-xs p-2 bg-muted rounded-md block mt-1">% Deságio = (Valor do Deságio / Valor de Face) * 100</code>
                      </div>
                      <div>
                        <p className="font-semibold">Cálculo Aplicado:</p>
                        <code className="text-xs p-2 bg-muted rounded-md block mt-1">{result.discountPercentage.toFixed(2)}% = ({formatCurrency(result.discountValue)} / {formatCurrency(parseFloat(creditAmount))}) * 100</code>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
            </CardContent>
          </Card>
        )}
      </div>
  );
}
