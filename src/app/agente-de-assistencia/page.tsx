import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { CalculatorIcon, AlertTriangle } from 'lucide-react';
import { TaxCalculator } from './calculator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function CalculatorPage() {
  return (
    <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8 max-w-2xl">
      <Card className="border-primary/20">
        <CardHeader className="text-center">
            <div className="mx-auto bg-primary/10 text-primary p-3 rounded-full w-fit mb-4">
                <CalculatorIcon className="h-8 w-8" />
            </div>
          <CardTitle className="text-3xl font-bold font-headline">Calculadora Tributária</CardTitle>
          <CardDescription>
            Simule cálculos de deságio e de diversos tributos de forma rápida e prática.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive" className="mb-6 bg-yellow-50 border-yellow-200 text-yellow-800 [&>svg]:text-yellow-800">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Atenção</AlertTitle>
            <AlertDescription>
              Esta é uma ferramenta para simulação. Os resultados são estimativas e não substituem a consultoria de um profissional de contabilidade.
            </AlertDescription>
          </Alert>
          <TaxCalculator />
        </CardContent>
      </Card>
    </div>
  );
}
