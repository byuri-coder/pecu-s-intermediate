'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BadgePercent, Minus, Plus } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Helper to format currency
const formatCurrency = (value: number) => {
    if (isNaN(value)) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

// 1. Calculadora de Deságio
function DiscountCalculator() {
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
    }
  };

  return (
    <Card className="shadow-lg border-none">
      <CardContent className="p-6 space-y-6">
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
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}

// 2. Calculadora de Imposto Genérica
function SimpleTaxCalculator({ taxName, taxRate, taxRateLabel = `Alíquota de ${taxName} (%)` }: { taxName: string, taxRate: number, taxRateLabel?: string }) {
    const [baseValue, setBaseValue] = useState('');
    const [rate, setRate] = useState(taxRate.toString());
    const [result, setResult] = useState<number | null>(null);

    const handleCalculate = () => {
        const value = parseFloat(baseValue);
        const taxRateValue = parseFloat(rate);
        if (!isNaN(value) && !isNaN(taxRateValue)) {
            setResult((value * taxRateValue) / 100);
        } else {
            setResult(null);
        }
    };
    
    return (
         <Card className="shadow-lg border-none">
            <CardContent className="p-6 space-y-6">
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor={`${taxName}-baseValue`}>Valor da Base de Cálculo (R$)</Label>
                        <Input id={`${taxName}-baseValue`} type="number" placeholder="Ex: 1000" value={baseValue} onChange={(e) => setBaseValue(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor={`${taxName}-rate`}>{taxRateLabel}</Label>
                        <Input id={`${taxName}-rate`} type="number" value={rate} onChange={(e) => setRate(e.target.value)} />
                    </div>
                </div>
                <Button onClick={handleCalculate} className="w-full">Calcular {taxName}</Button>
                {result !== null && (
                    <Card className="bg-secondary/30 border-primary/20">
                        <CardHeader className="p-4"><CardTitle className="text-lg text-center">Resultado do {taxName}</CardTitle></CardHeader>
                        <CardContent className="p-4 pt-0">
                            <div className="flex justify-between items-center bg-background p-3 rounded-md">
                                <span className="text-muted-foreground">Valor do Imposto</span>
                                <span className="font-bold text-primary text-lg">{formatCurrency(result)}</span>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </CardContent>
        </Card>
    );
}

// 3. Calculadora PIS/COFINS (Cumulativo)
function PisCofinsCalculator() {
    const [baseValue, setBaseValue] = useState('');
    const [result, setResult] = useState<{ pis: number, cofins: number, total: number } | null>(null);
    const PIS_RATE = 0.65;
    const COFINS_RATE = 3.00;

    const handleCalculate = () => {
        const value = parseFloat(baseValue);
        if (!isNaN(value)) {
            const pis = (value * PIS_RATE) / 100;
            const cofins = (value * COFINS_RATE) / 100;
            setResult({ pis, cofins, total: pis + cofins });
        } else {
            setResult(null);
        }
    };

    return (
        <Card className="shadow-lg border-none">
            <CardContent className="p-6 space-y-6">
                 <p className="text-sm text-center text-muted-foreground">Cálculo simplificado para o regime cumulativo (Lucro Presumido).</p>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="pis-cofins-baseValue">Valor do Faturamento (R$)</Label>
                        <Input id="pis-cofins-baseValue" type="number" placeholder="Ex: 10000" value={baseValue} onChange={(e) => setBaseValue(e.target.value)} />
                    </div>
                </div>
                <Button onClick={handleCalculate} className="w-full">Calcular PIS/COFINS</Button>
                {result && (
                    <Card className="bg-secondary/30 border-primary/20">
                        <CardHeader className="p-4"><CardTitle className="text-lg text-center">Resultado do Cálculo</CardTitle></CardHeader>
                        <CardContent className="p-4 pt-0 space-y-3">
                            <div className="flex justify-between items-center bg-background p-3 rounded-md">
                                <span className="text-muted-foreground">PIS ({PIS_RATE}%)</span>
                                <span className="font-bold text-primary">{formatCurrency(result.pis)}</span>
                            </div>
                            <div className="flex justify-between items-center bg-background p-3 rounded-md">
                                <span className="text-muted-foreground">COFINS ({COFINS_RATE}%)</span>
                                <span className="font-bold text-primary">{formatCurrency(result.cofins)}</span>
                            </div>
                             <div className="flex justify-between items-center bg-background p-3 rounded-md border-t-2 border-primary/20 mt-2 pt-3">
                                <span className="text-muted-foreground font-bold">Total</span>
                                <span className="font-bold text-primary text-lg">{formatCurrency(result.total)}</span>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </CardContent>
        </Card>
    );
}


// Componente principal que une todas as calculadoras
export function TaxCalculator() {
  return (
    <Tabs defaultValue="desagio" className="w-full">
      <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 h-auto">
        <TabsTrigger value="desagio">Deságio</TabsTrigger>
        <TabsTrigger value="icms">ICMS</TabsTrigger>
        <TabsTrigger value="ipi">IPI</TabsTrigger>
        <TabsTrigger value="pis-cofins">PIS/COFINS</TabsTrigger>
        <TabsTrigger value="irpj-csll">IRPJ/CSLL</TabsTrigger>
      </TabsList>
      <TabsContent value="desagio">
        <DiscountCalculator />
      </TabsContent>
      <TabsContent value="icms">
        <SimpleTaxCalculator taxName="ICMS" taxRate={18} />
      </TabsContent>
      <TabsContent value="ipi">
        <SimpleTaxCalculator taxName="IPI" taxRate={10} taxRateLabel="Alíquota de IPI (%)" />
      </TabsContent>
      <TabsContent value="pis-cofins">
        <PisCofinsCalculator />
      </TabsContent>
       <TabsContent value="irpj-csll">
        <SimpleTaxCalculator taxName="IRPJ/CSLL" taxRate={24} taxRateLabel="Alíquota IRPJ+CSLL (%) (Lucro Real)" />
      </TabsContent>
    </Tabs>
  );
}
