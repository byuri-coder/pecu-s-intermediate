'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/card';
import { Calendar, TrendingUp, TrendingDown, Leaf, Landmark, Mountain } from 'lucide-react';
import { cn } from '@/lib/utils';
import { placeholderOperations } from '@/lib/placeholder-data';
import type { Operation } from '@/lib/types';
import { isSameDay } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';


const AssetIcon = ({ assetType }: { assetType: Operation['assetType'] }) => {
    const icons = {
        'Crédito de Carbono': Leaf,
        'Crédito Tributário': Landmark,
        'Terra Rural': Mountain,
    };
    const Icon = icons[assetType];
    return <Icon className="h-5 w-5 flex-shrink-0" />;
};


export default function CalendarPage() {
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  const [selectedDayOperations, setSelectedDayOperations] = React.useState<Operation[]>([]);

  const operationDates = React.useMemo(() => 
    placeholderOperations.map((op) => op.date),
  []);

  React.useEffect(() => {
    if (date) {
      const ops = placeholderOperations.filter((op) => isSameDay(op.date, date));
      setSelectedDayOperations(ops);
    } else {
        setSelectedDayOperations([]);
    }
  }, [date]);

  return (
    <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8 max-w-7xl">
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="flex justify-center">
                    <Card className="p-0">
                        <CalendarComponent
                            mode="single"
                            selected={date}
                            onSelect={setDate}
                            className="rounded-md"
                            modifiers={{
                                hasOperation: operationDates,
                            }}
                            modifiersClassNames={{
                                hasOperation: 'day-with-operation',
                            }}
                        />
                    </Card>
                </div>
                <div className="space-y-4">
                    <h3 className="text-xl font-semibold font-headline">
                        Operações para {date ? date.toLocaleDateString('pt-BR') : 'Nenhuma data selecionada'}
                    </h3>
                    <ScrollArea className="h-[380px] pr-4">
                        {selectedDayOperations.length > 0 ? (
                             <div className="space-y-4">
                                {selectedDayOperations.map((op, index) => (
                                    <React.Fragment key={op.id}>
                                        <Card className="p-4 hover:shadow-md transition-shadow">
                                            <div className="flex items-start gap-4">
                                                <div className={cn("p-2 rounded-full", op.type === 'Venda' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700')}>
                                                    {op.type === 'Venda' ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
                                                </div>
                                                <div className="flex-grow">
                                                    <div className="flex justify-between items-center mb-1">
                                                        <p className="font-semibold">{op.type}</p>
                                                        <Badge variant="secondary" className="flex items-center gap-1.5">
                                                            <AssetIcon assetType={op.assetType}/>
                                                            {op.assetType}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground">{op.description}</p>
                                                    <p className="text-lg font-bold text-primary mt-2">
                                                         {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(op.value)}
                                                    </p>
                                                </div>
                                            </div>
                                        </Card>
                                        {index < selectedDayOperations.length - 1 && <Separator />}
                                    </React.Fragment>
                                ))}
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-full text-center text-muted-foreground bg-secondary/30 rounded-lg">
                                <div>
                                    <p className="font-semibold">Nenhuma operação neste dia.</p>
                                    <p className="text-sm">Selecione um dia destacado no calendário para ver os detalhes.</p>
                                </div>
                            </div>
                        )}
                    </ScrollArea>
                </div>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
