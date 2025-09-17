
"use client"

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { CalculatorIcon, AlertTriangle, BadgePercent, Landmark, FileText, Minus, Plus, Scale, ReceiptText, Briefcase, Users, Percent, TrendingUp } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Link from 'next/link';
import { DiscountCalculator, SimpleInterestCalculator, CompoundInterestCalculator } from './calculator';
import { IcmsCalculator, PisCofinsCalculator, DifalCalculator } from './financial-calculators';
import { PJCalculator, EmployeeCostCalculator } from './business-calculators';
import { Line, LineChart, Pie, PieChart, Cell, ResponsiveContainer, Tooltip, Legend, XAxis, YAxis } from 'recharts';

const calculators = [
    {
        title: 'Calculadora de Deságio',
        description: 'Calcule o valor e o percentual de deságio em operações com créditos.',
        icon: BadgePercent,
        href: '/agente-de-assistencia/desagio',
        component: DiscountCalculator
    },
    {
        title: 'Juros Simples',
        description: 'Calcule juros simples para aplicações ou empréstimos.',
        icon: Percent,
        href: '/agente-de-assistencia/juros-simples',
        component: SimpleInterestCalculator,
    },
    {
        title: 'Juros Compostos',
        description: 'Simule o poder dos juros compostos em seus investimentos.',
        icon: TrendingUp,
        href: '/agente-de-assistencia/juros-compostos',
        component: CompoundInterestCalculator,
    },
    {
        title: 'Calculadora de ICMS',
        description: 'Simule o cálculo básico de ICMS em operações.',
        icon: Landmark,
        href: '/agente-de-assistencia/icms',
        component: IcmsCalculator
    },
    {
        title: 'Calculadora PIS/COFINS',
        description: 'Cálculo simplificado para o regime cumulativo (Lucro Presumido).',
        icon: FileText,
        href: '/agente-de-assistencia/pis-cofins',
        component: PisCofinsCalculator
    },
     {
        title: 'Calculadora DIFAL',
        description: 'Calcule o Diferencial de Alíquota para consumidor final.',
        icon: Plus,
        href: '/agente-de-assistencia/difal',
        component: DifalCalculator
    },
    {
        title: 'Calculadora para PJ',
        description: 'Compare regimes tributários (Simples, Presumido, Real).',
        icon: Briefcase,
        href: '/agente-de-assistencia/pj',
        component: PJCalculator,
    },
    {
        title: 'Custos de Funcionário',
        description: 'Estime o custo total de um funcionário para sua empresa.',
        icon: Users,
        href: '/agente-de-assistencia/custo-funcionario',
        component: EmployeeCostCalculator,
    },
];

const CalculatorCard = ({ title, description, icon: Icon, href, ComingSoon }: { title: string; description: string; icon: React.ElementType; href: string; ComingSoon?: boolean }) => (
    <div className="relative">
        <Card className="h-full flex flex-col items-center justify-center text-center p-6 hover:shadow-lg hover:border-primary transition-all duration-300">
            <Icon className="h-10 w-10 mb-4 text-primary" />
            <h3 className="font-semibold text-lg">{title}</h3>
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
        </Card>
        {ComingSoon && (
            <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center rounded-lg">
                <span className="font-bold text-primary">Em Breve</span>
            </div>
        )}
    </div>
);

const FinancialChart = ({ data, chartType }: { data: any, chartType: string }) => {
    let chartContent = null;
    let title = "Gráfico de Resultados";
    let description = "Visualize o resultado dos seus cálculos.";

    const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    const COLORS = ['hsl(var(--primary))', 'hsl(var(--primary) / 0.3)'];

    if (chartType === 'Calculadora de Deságio' && data) {
        title = "Composição do Valor do Crédito";
        description = "Proporção entre preço de venda e deságio.";
        const chartData = [
            { name: 'Preço de Venda', value: data.price },
            { name: 'Deságio', value: data.discountValue },
        ];
        chartContent = (
             <PieChart>
                <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                    {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value as number)}/>
                <Legend />
            </PieChart>
        );
    } else if (chartType === 'Juros Simples' && data) {
        title = "Capital vs. Juros";
        description = "Proporção entre o capital inicial e os juros acumulados.";
        const chartData = [
            { name: 'Capital Inicial', value: data.principal },
            { name: 'Juros Simples', value: data.totalInterest },
        ];
        chartContent = (
            <PieChart>
                <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                    {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value as number)}/>
                <Legend />
            </PieChart>
        );
    } else if (chartType === 'Juros Compostos' && data && data.monthlyData) {
        title = "Evolução do Investimento";
        description = "Curva de crescimento do montante ao longo dos meses.";
        chartContent = (
            <LineChart data={data.monthlyData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => formatCurrency(value)}/>
                <Tooltip formatter={(value) => formatCurrency(value as number)}/>
                <Legend />
                <Line type="monotone" dataKey="value" name="Montante" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }}/>
            </LineChart>
        );
    }

    return (
        <Card className="bg-secondary/30">
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                   {chartContent || (
                        <div className="h-full flex items-center justify-center text-muted-foreground bg-background rounded-lg">
                            <p className="text-center">Calcule para ver o gráfico.</p>
                        </div>
                   )}
                </ResponsiveContainer>
            </CardContent>
        </Card>
    )
}


export default function CalculatorHubPage() {
    const [selectedCalculatorKey, setSelectedCalculatorKey] = React.useState(calculators[0].title);
    const [chartData, setChartData] = React.useState(null);

    const SelectedCalculator = React.useMemo(() => {
        return calculators.find(c => c.title === selectedCalculatorKey)?.component || null;
    }, [selectedCalculatorKey]);

    const handleSelectCalc = (component: React.ElementType | null, title: string) => {
        if(component) {
            setSelectedCalculatorKey(title);
            setChartData(null); // Reset chart on new selection
        }
    };


  return (
    <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8 max-w-7xl">
        <Card className="border-primary/20">
            <CardHeader className="text-center">
                <div className="mx-auto bg-primary/10 text-primary p-3 rounded-full w-fit mb-4">
                    <CalculatorIcon className="h-8 w-8" />
                </div>
                <CardTitle className="text-3xl font-bold font-headline">CALCULADORAS E SIMULADORES</CardTitle>
                <CardDescription>
                    Explore nossas calculadoras financeiras para planejar seu futuro financeiro com confiança.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                    {calculators.map(calc => (
                         <div key={calc.title} onClick={() => handleSelectCalc(calc.component, calc.title)} className="cursor-pointer">
                            <CalculatorCard 
                                title={calc.title} 
                                description={calc.description} 
                                icon={calc.icon}
                                href={calc.href}
                                ComingSoon={!calc.component}
                            />
                         </div>
                    ))}
                </div>
                
                <Alert variant="destructive" className="mb-6 bg-yellow-50 border-yellow-200 text-yellow-800 [&>svg]:text-yellow-800">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Atenção</AlertTitle>
                    <AlertDescription>
                    Esta é uma ferramenta para simulação. Os resultados são estimativas e não substituem a consultoria de um profissional de contabilidade.
                    </AlertDescription>
                </Alert>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                     <Card>
                        <CardHeader>
                            <CardTitle>{selectedCalculatorKey}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {SelectedCalculator ? <SelectedCalculator onCalculate={setChartData}/> : <p>Selecione uma calculadora.</p>}
                        </CardContent>
                    </Card>

                    <FinancialChart data={chartData} chartType={selectedCalculatorKey}/>
                </div>
            </CardContent>
        </Card>
    </div>
  );
}
