"use client"

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { CalculatorIcon, AlertTriangle, BadgePercent, Landmark, FileText, Minus, Plus, Scale } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Link from 'next/link';
import { DiscountCalculator } from './calculator';

const calculators = [
    {
        title: 'Calculadora de Deságio',
        description: 'Calcule o valor e o percentual de deságio em operações com créditos.',
        icon: BadgePercent,
        href: '/agente-de-assistencia/desagio',
        component: <DiscountCalculator />
    },
    {
        title: 'Calculadora de ICMS',
        description: 'Simule o cálculo básico de ICMS em operações.',
        icon: Landmark,
        href: '/agente-de-assistencia/icms',
        component: null // Placeholder for future component
    },
    {
        title: 'Calculadora PIS/COFINS',
        description: 'Cálculo simplificado para o regime cumulativo (Lucro Presumido).',
        icon: FileText,
        href: '/agente-de-assistencia/pis-cofins',
        component: null
    },
    {
        title: 'Calculadora ICMS-ST',
        description: 'Simulação de cálculo de ICMS por Substituição Tributária.',
        icon: Landmark,
        href: '/agente-de-assistencia/icms-st',
        component: null
    },
    {
        title: 'Calculadora DIFAL',
        description: 'Calcule o Diferencial de Alíquota para consumidor final.',
        icon: Minus,
        href: '/agente-de-assistencia/difal',
        component: null
    },
    {
        title: 'Calculadora IRPJ/CSLL',
        description: 'Estimativa de IRPJ e CSLL para Lucro Real ou Presumido.',
        icon: Scale,
        href: '/agente-de-assistencia/irpj-csll',
        component: null
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


export default function CalculatorHubPage() {
    const [selectedCalculator, setSelectedCalculator] = React.useState<React.ReactNode>(<DiscountCalculator />);
    const [activeCalc, setActiveCalc] = React.useState('Calculadora de Deságio');


    const handleSelectCalc = (component: React.ReactNode, title: string) => {
        if(component) {
            setSelectedCalculator(component);
            setActiveCalc(title);
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

                <Card>
                    <CardHeader>
                        <CardTitle>{activeCalc}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {selectedCalculator}
                    </CardContent>
                </Card>
            </CardContent>
        </Card>
    </div>
  );
}
