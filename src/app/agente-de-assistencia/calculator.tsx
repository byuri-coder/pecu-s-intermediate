
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BadgePercent, Minus, Plus, Calendar, DollarSign, PiggyBank } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Helper to format currency
const formatCurrency = (value: number) => {
    if (isNaN(value)) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

// 1. Calculadora de Deságio
export function DiscountCalculator({ onCalculate }: { onCalculate: (data: any) => void }) {
  const [creditAmount, setCreditAmount] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [result, setResult] = useState<{ discountValue: number; discountPercentage: number } | null>(null);

  const handleCalculate = () => {
    const amount = parseFloat(creditAmount);
    const price = parseFloat(sellingPrice);

    if (!isNaN(amount) && !isNaN(price) && amount > 0 && price > 0 && price <= amount) {
      const discountValue = amount - price;
      const discountPercentage = (discountValue / amount) * 100;
      const calcResult = { discountValue, discountPercentage };
      setResult(calcResult);
      onCalculate({ ...calcResult, price, amount });
    } else {
      setResult(null);
      onCalculate(null);
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

// 2. Calculadora de Juros Simples
export function SimpleInterestCalculator({ onCalculate }: { onCalculate: (data: any) => void }) {
    const [principal, setPrincipal] = useState('');
    const [rate, setRate] = useState('');
    const [ratePeriod, setRatePeriod] = useState('monthly');
    const [time, setTime] = useState('');
    const [timePeriod, setTimePeriod] = useState('months');
    const [result, setResult] = useState<{ totalAmount: number; totalInterest: number } | null>(null);

    const handleCalculate = () => {
        const P = parseFloat(principal);
        const inputRate = parseFloat(rate);
        const inputTime = parseFloat(time);

        if (!isNaN(P) && !isNaN(inputRate) && !isNaN(inputTime) && P > 0 && inputRate > 0 && inputTime > 0) {
            
            // Normalize everything to months
            const i = ratePeriod === 'annual' ? (inputRate / 100) / 12 : inputRate / 100;
            const t = timePeriod === 'years' ? inputTime * 12 : inputTime;

            const totalInterest = P * i * t;
            const totalAmount = P + totalInterest;
            const calcResult = { totalAmount, totalInterest };
            setResult(calcResult);
            onCalculate({ ...calcResult, principal: P });
        } else {
            setResult(null);
            onCalculate(null);
            alert("Por favor, preencha todos os campos com valores positivos.");
        }
    };

    return (
        <div className="space-y-6">
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="principal">Capital Inicial (R$)</Label>
                    <Input id="principal" type="number" placeholder="Ex: 1000" value={principal} onChange={e => setPrincipal(e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-2">
                         <Label htmlFor="rate">Taxa de Juros</Label>
                         <Input id="rate" type="number" placeholder="Ex: 1.5" value={rate} onChange={e => setRate(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                         <Label htmlFor="rate-period">Período da Taxa</Label>
                         <Select value={ratePeriod} onValueChange={setRatePeriod}>
                            <SelectTrigger id="rate-period"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="monthly">ao mês</SelectItem>
                                <SelectItem value="annual">ao ano</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                 <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-2">
                        <Label htmlFor="time">Período</Label>
                        <Input id="time" type="number" placeholder="Ex: 12" value={time} onChange={e => setTime(e.target.value)} />
                    </div>
                     <div className="space-y-2">
                         <Label htmlFor="time-period">Unidade</Label>
                         <Select value={timePeriod} onValueChange={setTimePeriod}>
                            <SelectTrigger id="time-period"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="months">Meses</SelectItem>
                                <SelectItem value="years">Anos</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>
            <Button onClick={handleCalculate} className="w-full">Calcular Juros Simples</Button>
            {result && (
                <Card className="bg-secondary/30 border-primary/20">
                    <CardHeader className="p-4"><CardTitle className="text-lg text-center">Resultado do Cálculo</CardTitle></CardHeader>
                    <CardContent className="p-4 pt-0 space-y-3">
                        <div className="flex justify-between items-center bg-background p-3 rounded-md">
                            <span className="text-muted-foreground">Total de Juros</span>
                            <span className="font-bold text-primary text-lg flex items-center gap-1">
                                <Plus className="h-5 w-5"/>
                                {formatCurrency(result.totalInterest)}
                            </span>
                        </div>
                        <div className="flex justify-between items-center bg-background p-3 rounded-md">
                            <span className="text-muted-foreground">Montante Final</span>
                            <span className="font-bold text-primary text-lg flex items-center gap-1">
                                <PiggyBank className="h-5 w-5"/>
                                {formatCurrency(result.totalAmount)}
                            </span>
                        </div>
                         <Accordion type="single" collapsible className="w-full">
                            <AccordionItem value="item-1">
                                <AccordionTrigger className="text-sm">Ver Fórmula</AccordionTrigger>
                                <AccordionContent className="space-y-3 text-sm p-2 bg-background rounded-md">
                                    <p className="font-semibold">Fórmula do Montante (Juros Simples):</p>
                                    <code className="text-xs p-2 bg-muted rounded-md block mt-1">M = P * (1 + i * t)</code>
                                    <p className="text-xs">Onde: <b>M</b> = Montante, <b>P</b> = Capital, <b>i</b> = Taxa, <b>t</b> = Tempo</p>
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

// 3. Calculadora de Juros Compostos
export function CompoundInterestCalculator({ onCalculate }: { onCalculate: (data: any) => void }) {
    const [principal, setPrincipal] = useState('');
    const [rate, setRate] = useState('');
    const [ratePeriod, setRatePeriod] = useState('monthly');
    const [time, setTime] = useState('');
    const [timePeriod, setTimePeriod] = useState('months');
    const [monthlyContribution, setMonthlyContribution] = useState('0');
    const [result, setResult] = useState<{ totalAmount: number; totalInterest: number; totalInvested: number; monthlyData: { month: number; value: number }[] } | null>(null);

    const handleCalculate = () => {
        const P = parseFloat(principal);
        const inputRate = parseFloat(rate);
        const inputTime = parseFloat(time);
        const C = parseFloat(monthlyContribution) || 0;

        if (!isNaN(P) && !isNaN(inputRate) && !isNaN(inputTime) && P >= 0 && inputRate > 0 && inputTime > 0) {
            
            // Normalize everything to months for calculation
            const i = ratePeriod === 'annual' ? Math.pow(1 + (inputRate / 100), 1/12) - 1 : inputRate / 100;
            const t = timePeriod === 'years' ? inputTime * 12 : inputTime;

            const monthlyData: { month: number; value: number }[] = [];
            let currentAmount = P;

            for (let month = 1; month <= t; month++) {
                currentAmount = currentAmount * (1 + i) + C;
                monthlyData.push({ month, value: parseFloat(currentAmount.toFixed(2)) });
            }
            
            const totalAmount = currentAmount;
            const totalInvested = P + (C * t);
            const totalInterest = totalAmount - totalInvested;
            
            const calcResult = { totalAmount, totalInterest, totalInvested, monthlyData };
            setResult(calcResult);
            onCalculate(calcResult);
        } else {
            setResult(null);
            onCalculate(null);
            alert("Por favor, preencha o capital inicial, a taxa e o tempo com valores positivos.");
        }
    };

    return (
        <div className="space-y-6">
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="principal-compound">Capital Inicial (R$)</Label>
                    <Input id="principal-compound" type="number" placeholder="Ex: 1000" value={principal} onChange={e => setPrincipal(e.target.value)} />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="contribution-compound">Aporte Mensal (R$, opcional)</Label>
                    <Input id="contribution-compound" type="number" placeholder="Ex: 100" value={monthlyContribution} onChange={e => setMonthlyContribution(e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-2">
                        <Label htmlFor="rate-compound">Taxa de Juros</Label>
                        <Input id="rate-compound" type="number" placeholder="Ex: 1" value={rate} onChange={e => setRate(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="rate-period-compound">Período da Taxa</Label>
                        <Select value={ratePeriod} onValueChange={setRatePeriod}>
                            <SelectTrigger id="rate-period-compound"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="monthly">ao mês</SelectItem>
                                <SelectItem value="annual">ao ano</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-2">
                        <Label htmlFor="time-compound">Período</Label>
                        <Input id="time-compound" type="number" placeholder="Ex: 12" value={time} onChange={e => setTime(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="time-period-compound">Unidade</Label>
                         <Select value={timePeriod} onValueChange={setTimePeriod}>
                            <SelectTrigger id="time-period-compound"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="months">Meses</SelectItem>
                                <SelectItem value="years">Anos</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>
            <Button onClick={handleCalculate} className="w-full">Calcular Juros Compostos</Button>
            {result && (
                <Card className="bg-secondary/30 border-primary/20">
                    <CardHeader className="p-4"><CardTitle className="text-lg text-center">Resultado do Cálculo</CardTitle></CardHeader>
                    <CardContent className="p-4 pt-0 space-y-3">
                         <div className="flex justify-between items-center bg-background p-3 rounded-md">
                            <span className="text-muted-foreground">Total Investido</span>
                            <span className="font-bold text-lg">{formatCurrency(result.totalInvested)}</span>
                        </div>
                        <div className="flex justify-between items-center bg-background p-3 rounded-md">
                            <span className="text-muted-foreground">Total de Juros</span>
                             <span className="font-bold text-green-600 text-lg flex items-center gap-1">
                                <Plus className="h-5 w-5"/>
                                {formatCurrency(result.totalInterest)}
                            </span>
                        </div>
                        <div className="flex justify-between items-center bg-background p-3 rounded-md">
                            <span className="text-muted-foreground">Montante Final</span>
                            <span className="font-bold text-primary text-lg flex items-center gap-1">
                                <PiggyBank className="h-5 w-5"/>
                                {formatCurrency(result.totalAmount)}
                            </span>
                        </div>
                        <Accordion type="single" collapsible className="w-full">
                            <AccordionItem value="item-1">
                                <AccordionTrigger className="text-sm">Ver Fórmulas</AccordionTrigger>
                                <AccordionContent className="space-y-3 text-sm p-2 bg-background rounded-md">
                                    <p className="font-semibold">Fórmula do Montante (Juros Compostos):</p>
                                    <code className="text-xs p-2 bg-muted rounded-md block mt-1">M = P * (1 + i)^t</code>
                                     <p className="font-semibold mt-2">Fórmula com Aportes Mensais (C):</p>
                                     <code className="text-xs p-2 bg-muted rounded-md block mt-1">M = [P * (1+i)^t] + [C * (((1+i)^t - 1) / i)]</code>
                                    <p className="text-xs">Onde: <b>M</b> = Montante, <b>P</b> = Capital, <b>i</b> = Taxa, <b>t</b> = Tempo, <b>C</b> = Aporte</p>
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

    

    