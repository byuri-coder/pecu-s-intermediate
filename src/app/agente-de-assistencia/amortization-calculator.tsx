
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Download } from 'lucide-react';

type AmortizationRow = {
    month: number;
    installment: number;
    interest: number;
    amortization: number;
    balance: number;
};

// Helper to format currency
const formatCurrency = (value: number) => {
    if (isNaN(value)) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};


export function AmortizationCalculator({ onCalculate }: { onCalculate: (data: any) => void }) {
    const [loanAmount, setLoanAmount] = useState('');
    const [interestRate, setInterestRate] = useState('');
    const [installments, setInstallments] = useState('');
    const [amortizationType, setAmortizationType] = useState<'price' | 'sac'>('price');
    const [result, setResult] = useState<AmortizationRow[] | null>(null);

    const handleCalculate = () => {
        const PV = parseFloat(loanAmount);
        const i = parseFloat(interestRate) / 100;
        const n = parseInt(installments);

        if (isNaN(PV) || isNaN(i) || isNaN(n) || PV <= 0 || i <= 0 || n <= 0) {
            alert("Por favor, preencha todos os campos com valores positivos.");
            setResult(null);
            onCalculate(null);
            return;
        }

        let table: AmortizationRow[] = [];
        let balance = PV;

        if (amortizationType === 'price') {
            const pmt = PV * (i * Math.pow(1 + i, n)) / (Math.pow(1 + i, n) - 1);
            for (let k = 1; k <= n; k++) {
                const interest = balance * i;
                const amortization = pmt - interest;
                balance -= amortization;
                table.push({
                    month: k,
                    installment: pmt,
                    interest: interest,
                    amortization: amortization,
                    balance: balance < 0.01 ? 0 : balance, // Avoid small negative balances
                });
            }
        } else if (amortizationType === 'sac') {
            const amortization = PV / n;
            for (let k = 1; k <= n; k++) {
                const interest = balance * i;
                const installment = amortization + interest;
                balance -= amortization;
                 table.push({
                    month: k,
                    installment: installment,
                    interest: interest,
                    amortization: amortization,
                    balance: balance < 0.01 ? 0 : balance,
                });
            }
        }
        
        setResult(table);
        onCalculate({ type: amortizationType, table: table });
    };

    const handleExport = () => {
        if (!result) {
            alert("Nenhum dado para exportar. Por favor, calcule primeiro.");
            return;
        }

        const headers = ["Mês", "Parcela", "Juros", "Amortização", "Saldo Devedor"];
        const csvRows = [
            headers.join(';'),
            ...result.map(row => [
                row.month,
                row.installment.toFixed(2),
                row.interest.toFixed(2),
                row.amortization.toFixed(2),
                row.balance.toFixed(2)
            ].join(';'))
        ].join('\n');

        const blob = new Blob([`\uFEFF${csvRows}`], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.setAttribute('download', `tabela_amortizacao_${amortizationType}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-6">
            <div className="space-y-4">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="loanAmount">Valor do Financiamento (R$)</Label>
                        <Input id="loanAmount" type="number" placeholder="Ex: 100000" value={loanAmount} onChange={(e) => setLoanAmount(e.target.value)} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="installments">Número de Parcelas</Label>
                        <Input id="installments" type="number" placeholder="Ex: 360" value={installments} onChange={(e) => setInstallments(e.target.value)} />
                    </div>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="interestRate">Taxa de Juros Mensal (%)</Label>
                    <Input id="interestRate" type="number" placeholder="Ex: 0.85" value={interestRate} onChange={(e) => setInterestRate(e.target.value)} />
                </div>
                
                <RadioGroup defaultValue="price" value={amortizationType} onValueChange={(value: 'price' | 'sac') => setAmortizationType(value)} className="flex items-center space-x-4">
                    <Label>Sistema de Amortização:</Label>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="price" id="price" />
                        <Label htmlFor="price">Tabela Price</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="sac" id="sac" />
                        <Label htmlFor="sac">SAC</Label>
                    </div>
                </RadioGroup>
            </div>
            
            <Button onClick={handleCalculate} className="w-full">Calcular Amortização</Button>

            {result && (
                <Card className="bg-secondary/30 border-primary/20">
                    <CardHeader className="p-4 flex flex-row items-center justify-between">
                        <CardTitle className="text-lg text-center">Quadro de Amortização</CardTitle>
                         <Button variant="outline" size="sm" onClick={handleExport}>
                            <Download className="mr-2 h-4 w-4" />
                            Exportar CSV
                        </Button>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                        <ScrollArea className="h-72 w-full">
                            <Table>
                                <TableHeader className="sticky top-0 bg-secondary/50">
                                    <TableRow>
                                        <TableHead className="w-[60px]">Mês</TableHead>
                                        <TableHead>Parcela</TableHead>
                                        <TableHead>Juros</TableHead>
                                        <TableHead>Amortização</TableHead>
                                        <TableHead className="text-right">Saldo Devedor</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {result.map((row) => (
                                        <TableRow key={row.month}>
                                            <TableCell className="font-medium">{row.month}</TableCell>
                                            <TableCell>{formatCurrency(row.installment)}</TableCell>
                                            <TableCell>{formatCurrency(row.interest)}</TableCell>
                                            <TableCell>{formatCurrency(row.amortization)}</TableCell>
                                            <TableCell className="text-right">{formatCurrency(row.balance)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </ScrollArea>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

