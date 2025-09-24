
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

// 4. Calculadora de ICMS-ST
export function IcmsStCalculator() {
    const [productValue, setProductValue] = useState('');
    const [otherExpenses, setOtherExpenses] = useState('');
    const [ipiRate, setIpiRate] = useState('');
    const [mvaRate, setMvaRate] = useState('');
    const [internalRate, setInternalRate] = useState('');
    const [interstateRate, setInterstateRate] = useState('');

    const [result, setResult] = useState<{ icmsProprio: number; baseSt: number; icmsStTotal: number; icmsStRetido: number } | null>(null);

    const handleCalculate = () => {
        const valProd = parseFloat(productValue);
        const valDesp = parseFloat(otherExpenses) || 0;
        const valIpi = (parseFloat(ipiRate) / 100) * valProd || 0;
        const aliqMva = parseFloat(mvaRate) / 100;
        const aliqInterna = parseFloat(internalRate) / 100;
        const aliqInter = parseFloat(interstateRate) / 100;

        if (isNaN(valProd) || isNaN(aliqMva) || isNaN(aliqInterna) || isNaN(aliqInter) || valProd <= 0 || aliqMva < 0 || aliqInterna <= 0 || aliqInter <= 0) {
            setResult(null);
            alert("Por favor, preencha o valor do produto e as alíquotas (MVA, Interna, Interestadual) com valores válidos.");
            return;
        }

        const baseIcmsProprio = valProd + valDesp;
        const icmsProprio = baseIcmsProprio * aliqInter;

        const baseSt = (valProd + valIpi + valDesp) * (1 + aliqMva);
        const icmsStTotal = baseSt * aliqInterna;
        const icmsStRetido = icmsStTotal - icmsProprio;

        setResult({
            icmsProprio,
            baseSt,
            icmsStTotal,
            icmsStRetido: icmsStRetido > 0 ? icmsStRetido : 0
        });
    }

    return (
        <div className="space-y-6">
            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div className="space-y-2">
                        <Label htmlFor="productValue">Valor do Produto (R$)</Label>
                        <Input id="productValue" type="number" placeholder="1000" value={productValue} onChange={e => setProductValue(e.target.value)} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="otherExpenses">Frete/Seguro/Outros (R$)</Label>
                        <Input id="otherExpenses" type="number" placeholder="100" value={otherExpenses} onChange={e => setOtherExpenses(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="ipiRate">Alíquota IPI (%)</Label>
                        <Input id="ipiRate" type="number" placeholder="10" value={ipiRate} onChange={e => setIpiRate(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="mvaRate">MVA/IVA-ST (%)</Label>
                        <Input id="mvaRate" type="number" placeholder="40" value={mvaRate} onChange={e => setMvaRate(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="interstateRate">Alíquota ICMS Interestadual (%)</Label>
                        <Input id="interstateRate" type="number" placeholder="12" value={interstateRate} onChange={e => setInterstateRate(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="internalRate">Alíquota ICMS Interna (Destino) (%)</Label>
                        <Input id="internalRate" type="number" placeholder="18" value={internalRate} onChange={e => setInternalRate(e.target.value)} />
                    </div>
                </div>
            </div>
            <Button onClick={handleCalculate} className="w-full">Calcular ICMS-ST</Button>
            {result && (
                <Card className="bg-secondary/30 border-primary/20">
                    <CardHeader className="p-4"><CardTitle className="text-lg text-center">Resultado do Cálculo de ICMS-ST</CardTitle></CardHeader>
                    <CardContent className="p-4 pt-0 space-y-3">
                         <div className="flex justify-between items-center bg-background p-3 rounded-md">
                            <span className="text-muted-foreground">ICMS Próprio (Crédito na Origem)</span>
                            <span className="font-bold text-lg">{formatCurrency(result.icmsProprio)}</span>
                        </div>
                         <div className="flex justify-between items-center bg-background p-3 rounded-md">
                            <span className="text-muted-foreground">Base de Cálculo ICMS-ST</span>
                            <span className="font-bold text-lg">{formatCurrency(result.baseSt)}</span>
                        </div>
                         <div className="flex justify-between items-center bg-background p-3 rounded-md">
                            <span className="text-muted-foreground">ICMS Total na UF Destino</span>
                            <span className="font-bold text-lg">{formatCurrency(result.icmsStTotal)}</span>
                        </div>
                        <div className="flex justify-between items-center bg-background p-3 rounded-md border-t-2 border-primary/20 pt-3">
                            <span className="text-muted-foreground">ICMS-ST a ser Retido/Pago</span>
                            <span className="font-bold text-primary text-lg">{formatCurrency(result.icmsStRetido)}</span>
                        </div>
                        <p className="text-xs text-muted-foreground pt-2 text-center">Nota: Este é um cálculo simplificado. Fatores como FCP e benefícios fiscais não estão incluídos.</p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

// 5. Simulador de Parcelamento Tributário
export function TaxInstallmentSimulator() {
    const [principal, setPrincipal] = useState('');
    const [charges, setCharges] = useState('');
    const [discount, setDiscount] = useState('');
    const [downPayment, setDownPayment] = useState('');
    const [installments, setInstallments] = useState('');
    const [interestRate, setInterestRate] = useState('');

    const [result, setResult] = useState<{ consolidatedDebt: number; installmentValue: number; totalPaid: number} | null>(null);
    
    const handleCalculate = () => {
        const p = parseFloat(principal);
        const c = parseFloat(charges) || 0;
        const d = parseFloat(discount) / 100 || 0;
        const dp = parseFloat(downPayment) || 0;
        const n = parseInt(installments);
        const i = parseFloat(interestRate) / 100 || 0; // Monthly interest rate

        if(isNaN(p) || p <= 0 || isNaN(n) || n <= 0) {
            alert("Por favor, preencha o Valor Principal e o Número de Parcelas com valores positivos.");
            setResult(null);
            return;
        }

        const discountedCharges = c * (1 - d);
        const consolidatedDebt = p + discountedCharges;
        const financedAmount = consolidatedDebt - dp;

        if(financedAmount < 0) {
            alert("O valor da entrada não pode ser maior que a dívida consolidada.");
            setResult(null);
            return;
        }

        if(financedAmount === 0) {
             setResult({ consolidatedDebt, installmentValue: 0, totalPaid: dp });
             return;
        }

        let installmentValue;
        if(i > 0) {
            // Price Table calculation for installment value
            installmentValue = financedAmount * (i * Math.pow(1 + i, n)) / (Math.pow(1 + i, n) - 1);
        } else {
            // No interest on installments
            installmentValue = financedAmount / n;
        }

        const totalPaid = (installmentValue * n) + dp;

        setResult({ consolidatedDebt, installmentValue, totalPaid });
    };

    return (
        <div className="space-y-6">
            <div className="space-y-4">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="principalDebt">Valor Principal da Dívida (R$)</Label>
                        <Input id="principalDebt" type="number" value={principal} onChange={e => setPrincipal(e.target.value)} placeholder="Ex: 50000" />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="charges">Juros e Multas (R$)</Label>
                        <Input id="charges" type="number" value={charges} onChange={e => setCharges(e.target.value)} placeholder="Ex: 15000" />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="discount">Desconto sobre Juros/Multas (%)</Label>
                        <Input id="discount" type="number" value={discount} onChange={e => setDiscount(e.target.value)} placeholder="Ex: 90" />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="downPayment">Valor da Entrada (%)</Label>
                        <Input id="downPayment" type="number" value={downPayment} onChange={e => setDownPayment(e.target.value)} placeholder="Ex: 20" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="installmentsTax">Número de Parcelas</Label>
                        <Input id="installmentsTax" type="number" value={installments} onChange={e => setInstallments(e.target.value)} placeholder="Ex: 60" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="interestRateTax">Taxa de Juros do Parcelamento (% a.m.)</Label>
                        <Input id="interestRateTax" type="number" value={interestRate} onChange={e => setInterestRate(e.target.value)} placeholder="Ex: 1 (SELIC)" />
                    </div>
                </div>
            </div>
            <Button onClick={handleCalculate} className="w-full">Simular Parcelamento</Button>
             {result && (
                 <Card className="bg-secondary/30 border-primary/20">
                    <CardHeader className="p-4"><CardTitle className="text-lg text-center">Resultado da Simulação</CardTitle></CardHeader>
                    <CardContent className="p-4 pt-0 space-y-3">
                         <div className="flex justify-between items-center bg-background p-3 rounded-md">
                            <span className="text-muted-foreground">Dívida Consolidada com Desconto</span>
                            <span className="font-bold text-lg">{formatCurrency(result.consolidatedDebt)}</span>
                        </div>
                        <div className="flex justify-between items-center bg-background p-3 rounded-md">
                            <span className="text-muted-foreground">Valor da Parcela Mensal</span>
                             <span className="font-bold text-lg">{formatCurrency(result.installmentValue)}</span>
                        </div>
                        <div className="flex justify-between items-center bg-background p-3 rounded-md border-t border-primary/20 pt-3">
                            <span className="text-muted-foreground">Custo Total do Parcelamento</span>
                            <span className="font-bold text-primary text-lg">{formatCurrency(result.totalPaid)}</span>
                        </div>
                         <p className="text-xs text-muted-foreground pt-2 text-center">Cálculo da parcela baseado na Tabela Price. A taxa de juros pode variar (ex: SELIC). Consulte a legislação do programa específico.</p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

