import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Calendar } from 'lucide-react';

export default function CalendarPage() {
  return (
    <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8 max-w-5xl">
      <Card>
        <CardHeader>
            <div className="flex items-center gap-4">
                <Calendar className="h-8 w-8 text-primary" />
                <div>
                    <CardTitle className="text-3xl font-bold font-headline">Calendário de Operações</CardTitle>
                    <CardDescription>
                        Acompanhe suas transações de compra e venda ao longo do tempo.
                    </CardDescription>
                </div>
            </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Em breve: um calendário interativo para visualizar suas operações.</p>
        </CardContent>
      </Card>
    </div>
  );
}
