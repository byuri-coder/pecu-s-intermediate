import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { CalculatorIcon } from 'lucide-react';
import { Calculator } from './calculator';

export default function CalculatorPage() {
  return (
    <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8 max-w-md">
      <Card className="border-primary/20">
        <CardHeader className="text-center">
            <div className="mx-auto bg-primary/10 text-primary p-3 rounded-full w-fit mb-4">
                <CalculatorIcon className="h-8 w-8" />
            </div>
          <CardTitle className="text-3xl font-bold font-headline">Calculadora</CardTitle>
          <CardDescription>
            Utilize a calculadora para operações rápidas.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Calculator />
        </CardContent>
      </Card>
    </div>
  );
}
