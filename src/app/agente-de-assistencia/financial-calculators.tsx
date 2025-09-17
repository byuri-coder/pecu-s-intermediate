
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

// Helper to format currency
const formatCurrency = (value: number) => {
    if (isNaN(value)) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

// 1. Calculadora de ICMS
export function IcmsCalculator() {
    const [baseValue, setBaseValue] = useState('');
    const [icmsRate, setIcmsRate] = useState('');
    const [result, setResult] = useState<number | null>(null);

    const handleCalculate = () => {
        const value = parseFloat(baseValue);
        const rate = parseFloat(icmsRate) / 100;
        if(!isNaN(value) && !isNaN(rate) && value > 0 && rate > 0) {
            setResult(value * rate);
        } else {
            setResult(null);
            alert("Por favor, insira valores válidos e positivos.");
        }
    }

    return (
        <div className="space-y-6">
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="baseValueIcms">Valor da Operação (Base de Cálculo)</Label>
                    <Input id="baseValueIcms" type="number" placeholder="Ex: 1000" value={baseValue} onChange={e => setBaseValue(e.target.value)} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="icmsRate">Alíquota de ICMS (%)</Label>
                    <Input id="icmsRate" type="number" placeholder="Ex: 18" value={icmsRate} onChange={e => setIcmsRate(e.target.value)} />
                </div>
            </div>
            <Button onClick={handleCalculate} className="w-full">Calcular ICMS</Button>
            {result !== null && (
                <Card className="bg-secondary/30 border-primary/20">
                    <CardHeader className="p-4"><CardTitle className="text-lg text-center">Resultado</CardTitle></CardHeader>
                    <CardContent className="p-4 pt-0">
                        <div className="flex justify-between items-center bg-background p-3 rounded-md">
                            <span className="text-muted-foreground">Valor do ICMS</span>
                            <span className="font-bold text-primary text-lg">{formatCurrency(result)}</span>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

// 2. Calculadora PIS/COFINS (Regime Cumulativo)
export function PisCofinsCalculator() {
    const [revenue, setRevenue] = useState('');
    const [result, setResult] = useState<{ pis: number; cofins: number; total: number } | null>(null);

    const PIS_RATE = 0.0065; // 0.65%
    const COFINS_RATE = 0.03; // 3.00%

    const handleCalculate = () => {
        const value = parseFloat(revenue);
        if(!isNaN(value) && value > 0) {
            const pis = value * PIS_RATE;
            const cofins = value * COFINS_RATE;
            setResult({ pis, cofins, total: pis + cofins });
        } else {
            setResult(null);
            alert("Por favor, insira um faturamento válido e positivo.");
        }
    }

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <Label htmlFor="revenue">Faturamento Bruto Mensal</Label>
                <Input id="revenue" type="number" placeholder="Ex: 50000" value={revenue} onChange={e => setRevenue(e.target.value)} />
            </div>
            <Button onClick={handleCalculate} className="w-full">Calcular PIS/COFINS</Button>
            {result && (
                <Card className="bg-secondary/30 border-primary/20">
                     <CardHeader className="p-4"><CardTitle className="text-lg text-center">Resultado (Regime Cumulativo)</CardTitle></CardHeader>
                    <CardContent className="p-4 pt-0 space-y-3">
                         <div className="flex justify-between items-center bg-background p-3 rounded-md">
                            <span className="text-muted-foreground">Valor PIS (0.65%)</span>
                            <span className="font-bold text-lg">{formatCurrency(result.pis)}</span>
                        </div>
                        <div className="flex justify-between items-center bg-background p-3 rounded-md">
                            <span className="text-muted-foreground">Valor COFINS (3%)</span>
                             <span className="font-bold text-lg">{formatCurrency(result.cofins)}</span>
                        </div>
                        <div className="flex justify-between items-center bg-background p-3 rounded-md border-t border-primary/20 pt-3">
                            <span className="text-muted-foreground">Total</span>
                            <span className="font-bold text-primary text-lg">{formatCurrency(result.total)}</span>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

// 3. Calculadora de DIFAL
export function DifalCalculator() {
    const [operationValue, setOperationValue] = useState('');
    const [originRate, setOriginRate] = useState('');
    const [destRate, setDestRate] = useState('');
    const [result, setResult] = useState<number | null>(null);

    const handleCalculate = () => {
        const value = parseFloat(operationValue);
        const rateOrigin = parseFloat(originRate) / 100;
        const rateDest = parseFloat(destRate) / 100;

        if(!isNaN(value) && !isNaN(rateOrigin) && !isNaN(rateDest) && value > 0 && rateOrigin > 0 && rateDest > 0 && rateDest > rateOrigin) {
            const difalRate = rateDest - rateOrigin;
            const difalValue = value * difalRate;
            setResult(difalValue);
        } else {
            setResult(null);
            alert("Verifique os valores. A alíquota de destino deve ser maior que a de origem.");
        }
    }

    return (
        <div className="space-y-6">
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="operationValueDifal">Valor da Operação Interestadual</Label>
                    <Input id="operationValueDifal" type="number" placeholder="Ex: 1000" value={operationValue} onChange={e => setOperationValue(e.target.value)} />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="originRate">Alíquota ICMS Origem (%)</Label>
                    <Input id="originRate" type="number" placeholder="Ex: 7 ou 12" value={originRate} onChange={e => setOriginRate(e.target.value)} />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="destRate">Alíquota ICMS Destino (%)</Label>
                    <Input id="destRate" type="number" placeholder="Ex: 18" value={destRate} onChange={e => setDestRate(e.target.value)} />
                </div>
            </div>
            <Button onClick={handleCalculate} className="w-full">Calcular DIFAL</Button>
            {result !== null && (
                 <Card className="bg-secondary/30 border-primary/20">
                    <CardHeader className="p-4"><CardTitle className="text-lg text-center">Resultado</CardTitle></CardHeader>
                    <CardContent className="p-4 pt-0">
                        <div className="flex justify-between items-center bg-background p-3 rounded-md">
                            <span className="text-muted-foreground">Valor do DIFAL</span>
                            <span className="font-bold text-primary text-lg">{formatCurrency(result)}</span>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

