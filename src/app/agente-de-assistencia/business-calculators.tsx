
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';


// Helper to format currency
const formatCurrency = (value: number) => {
    if (isNaN(value)) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

// Tabelas do Simples Nacional (Receita Bruta em 12 meses)
const simplesTables = {
    'anexo-i': { // Comércio
        name: "Anexo I (Comércio)",
        ranges: [
            { limit: 180000, rate: 0.04, deduction: 0 },
            { limit: 360000, rate: 0.073, deduction: 5940 },
            { limit: 720000, rate: 0.095, deduction: 13860 },
            { limit: 1800000, rate: 0.107, deduction: 22500 },
            { limit: 3600000, rate: 0.143, deduction: 87300 },
            { limit: 4800000, rate: 0.19, deduction: 378000 },
        ]
    },
    'anexo-iii': { // Serviços
        name: "Anexo III (Serviços)",
        ranges: [
            { limit: 180000, rate: 0.06, deduction: 0 },
            { limit: 360000, rate: 0.112, deduction: 9360 },
            { limit: 720000, rate: 0.135, deduction: 17640 },
            { limit: 1800000, rate: 0.16, deduction: 35640 },
            { limit: 3600000, rate: 0.21, deduction: 125640 },
            { limit: 4800000, rate: 0.33, deduction: 648000 },
        ]
    },
    // Outros anexos podem ser adicionados aqui
};

// 1. Calculadora para PJ (Comparador de Regimes)
export function TaxRegimeComparator() {
    const [revenue, setRevenue] = useState('');
    const [simplesAnexo, setSimplesAnexo] = useState('anexo-iii');
    const [presumptionRate, setPresumptionRate] = useState('32');
    const [pisCofinsRate, setPisCofinsRate] = useState('3.65');
    const [issRate, setIssRate] = useState('5');
    
    const [result, setResult] = useState<{ simples: { tax: number; effectiveRate: number; }; presumido: { [key: string]: number } } | null>(null);

    const handleCalculate = () => {
        const monthlyRevenue = parseFloat(revenue);
        const presuncao = parseFloat(presumptionRate) / 100;
        const pisCofins = parseFloat(pisCofinsRate) / 100;
        const iss = parseFloat(issRate) / 100;
        
        if(!isNaN(monthlyRevenue) && monthlyRevenue > 0) {
            const annualRevenue = monthlyRevenue * 12;
            
            // --- Cálculo Simples Nacional ---
            const table = simplesTables[simplesAnexo as keyof typeof simplesTables];
            const range = table.ranges.find(r => annualRevenue <= r.limit);
            
            let simplesTax = 0;
            let effectiveRate = 0;

            if(range) {
                const calculatedRate = ((annualRevenue * range.rate) - range.deduction) / annualRevenue;
                effectiveRate = calculatedRate > 0 ? calculatedRate : 0;
                simplesTax = monthlyRevenue * effectiveRate;
            } else {
                // Fora do limite do Simples
                simplesTax = Infinity;
            }

            // --- Cálculo Lucro Presumido (Serviços) ---
            const pisCofinsTax = monthlyRevenue * pisCofins;
            const issTax = monthlyRevenue * iss;
            
            const irpjCsllBase = monthlyRevenue * presuncao;
            const irpjTax = irpjCsllBase * 0.15;
            const csllTax = irpjCsllBase * 0.09;
            
            const presumidoTotal = pisCofinsTax + issTax + irpjTax + csllTax;

            setResult({ 
                simples: { tax: simplesTax, effectiveRate: effectiveRate * 100 }, 
                presumido: {
                    baseCalculo: irpjCsllBase,
                    irpj: irpjTax,
                    csll: csllTax,
                    pisCofins: pisCofinsTax,
                    iss: issTax,
                    total: presumidoTotal,
                }
            });

        } else {
            setResult(null);
            alert("Por favor, insira um faturamento válido.");
        }
    }

    return (
        <div className="space-y-6">
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="revenuePJ">Faturamento Mensal Bruto</Label>
                    <Input id="revenuePJ" type="number" placeholder="Ex: 15000" value={revenue} onChange={e => setRevenue(e.target.value)} />
                </div>
                 <div className="space-y-2">
                    <Label>Anexo do Simples Nacional</Label>
                     <Select value={simplesAnexo} onValueChange={setSimplesAnexo}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="anexo-i">{simplesTables['anexo-i'].name}</SelectItem>
                            <SelectItem value="anexo-iii">{simplesTables['anexo-iii'].name}</SelectItem>
                            {/* Adicionar outros anexos aqui */}
                        </SelectContent>
                    </Select>
                </div>
                <div>
                     <h4 className="text-sm font-medium text-muted-foreground mb-2 mt-4">Parâmetros do Lucro Presumido (Serviços)</h4>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="presumptionRate">Base Presunção (%)</Label>
                            <Input id="presumptionRate" type="number" value={presumptionRate} onChange={e => setPresumptionRate(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="pisCofinsRate">PIS/COFINS (%)</Label>
                            <Input id="pisCofinsRate" type="number" value={pisCofinsRate} onChange={e => setPisCofinsRate(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="issRate">ISS (%)</Label>
                            <Input id="issRate" type="number" value={issRate} onChange={e => setIssRate(e.target.value)} />
                        </div>
                    </div>
                </div>
            </div>
            <Button onClick={handleCalculate} className="w-full">Comparar Regimes</Button>
            {result && (
                <Card className="bg-secondary/30 border-primary/20">
                    <CardHeader className="p-4"><CardTitle className="text-lg text-center">Estimativa Mensal de Impostos</CardTitle></CardHeader>
                    <CardContent className="p-4 pt-0 space-y-4">
                         <div className="flex justify-between items-center bg-background p-3 rounded-md">
                            <div>
                                <span className="text-muted-foreground">Simples Nacional</span>
                                <p className="text-xs">Alíquota Efetiva: {result.simples.effectiveRate.toFixed(2)}%</p>
                            </div>
                            <span className="font-bold text-primary text-lg">{isFinite(result.simples.tax) ? formatCurrency(result.simples.tax) : "Fora do Limite"}</span>
                        </div>
                        
                        <div>
                             <h4 className="text-md font-semibold text-center my-2 text-muted-foreground">Detalhes do Lucro Presumido</h4>
                             <Table>
                                <TableBody>
                                    <TableRow>
                                        <TableCell>Base de Cálculo (IRPJ/CSLL)</TableCell>
                                        <TableCell className="text-right">{formatCurrency(result.presumido.baseCalculo)}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>IRPJ (15%)</TableCell>
                                        <TableCell className="text-right">{formatCurrency(result.presumido.irpj)}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>CSLL (9%)</TableCell>
                                        <TableCell className="text-right">{formatCurrency(result.presumido.csll)}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>PIS/COFINS ({pisCofinsRate}%)</TableCell>
                                        <TableCell className="text-right">{formatCurrency(result.presumido.pisCofins)}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>ISS ({issRate}%)</TableCell>
                                        <TableCell className="text-right">{formatCurrency(result.presumido.iss)}</TableCell>
                                    </TableRow>
                                    <TableRow className="font-bold bg-background">
                                        <TableCell>Total Lucro Presumido</TableCell>
                                        <TableCell className="text-right text-primary text-lg">{formatCurrency(result.presumido.total)}</TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </div>
                        <p className="text-xs text-muted-foreground mt-4 text-center">Valores são estimativas. Lucro Real não incluído devido à complexidade. Consulte um contador.</p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

// 2. Calculadora de Custo de Funcionário
export function EmployeeCostCalculator() {
    const [salary, setSalary] = useState('');
    const [benefits, setBenefits] = useState('');
    const [isSimples, setIsSimples] = useState(false);
    const [result, setResult] = useState<{ [key: string]: number } | null>(null);

    const handleCalculate = () => {
        const grossSalary = parseFloat(salary);
        const otherBenefits = parseFloat(benefits) || 0;

        if (isNaN(grossSalary) || grossSalary <= 0) {
            setResult(null);
            alert("Por favor, insira um salário bruto válido.");
            return;
        }

        const INSS_RATE_EMPLOYEE = 0.075; // Simplificado
        const FGTS_RATE = 0.08;
        const PROVISAO_FERIAS_13 = 1/12 + 1/12; // 13º + Férias
        const PROVISAO_FERIAS_TERCO = (1/12) / 3; // Terço de férias

        // Contribuições da Empresa
        let inssPatronal = isSimples ? 0 : grossSalary * 0.20;
        let terceiros = isSimples ? 0 : grossSalary * 0.058; // RAT/FAP + Terceiros (simplificado)

        const fgts = grossSalary * FGTS_RATE;
        const provisaoTotal = grossSalary * (PROVISAO_FERIAS_13 + PROVISAO_FERIAS_TERCO);
        const encargosFgtsProvisao = provisaoTotal * FGTS_RATE;

        const totalEncargos = inssPatronal + terceiros + fgts + provisaoTotal + encargosFgtsProvisao;
        const totalCost = grossSalary + totalEncargos + otherBenefits;

        setResult({
            grossSalary,
            provisaoTotal,
            inssPatronal,
            terceiros,
            fgts,
            otherBenefits,
            totalCost,
        });
    }

    return (
        <div className="space-y-6">
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="grossSalary">Salário Bruto Mensal</Label>
                    <Input id="grossSalary" type="number" placeholder="Ex: 3000" value={salary} onChange={e => setSalary(e.target.value)} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="otherBenefits">Outros Benefícios Mensais (VT, VA, etc.)</Label>
                    <Input id="otherBenefits" type="number" placeholder="Ex: 500" value={benefits} onChange={e => setBenefits(e.target.value)} />
                </div>
                <div className="flex items-center space-x-2">
                    <Checkbox id="isSimples" checked={isSimples} onCheckedChange={(checked) => setIsSimples(Boolean(checked))} />
                    <Label htmlFor="isSimples" className="text-sm font-medium leading-none">
                        Empresa optante pelo Simples Nacional?
                    </Label>
                </div>
            </div>
             <Button onClick={handleCalculate} className="w-full">Calcular Custo Total</Button>
             {result && (
                <Card className="bg-secondary/30 border-primary/20">
                    <CardHeader className="p-4"><CardTitle className="text-lg text-center">Estimativa de Custo Mensal do Funcionário</CardTitle></CardHeader>
                    <CardContent className="p-4 pt-0">
                        <Table>
                            <TableBody>
                                <TableRow>
                                    <TableCell>Salário Bruto</TableCell>
                                    <TableCell className="text-right">{formatCurrency(result.grossSalary)}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>Provisão (Férias + 1/3, 13º)</TableCell>
                                    <TableCell className="text-right">{formatCurrency(result.provisaoTotal)}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>INSS Patronal</TableCell>
                                    <TableCell className="text-right">{formatCurrency(result.inssPatronal)}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>Sistema S / Terceiros</TableCell>
                                    <TableCell className="text-right">{formatCurrency(result.terceiros)}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>FGTS</TableCell>
                                    <TableCell className="text-right">{formatCurrency(result.fgts)}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>Outros Benefícios</TableCell>
                                    <TableCell className="text-right">{formatCurrency(result.otherBenefits)}</TableCell>
                                </TableRow>
                                <TableRow className="font-bold bg-background">
                                    <TableCell>Custo Total Mensal Estimado</TableCell>
                                    <TableCell className="text-right text-primary text-lg">{formatCurrency(result.totalCost)}</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                         <p className="text-xs text-muted-foreground mt-4 text-center">Cálculos simplificados. Não inclui multa rescisória, impostos sobre benefícios, etc.</p>
                    </CardContent>
                </Card>
             )}
        </div>
    )
}

    