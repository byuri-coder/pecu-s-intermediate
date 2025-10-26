'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Calendar as CalendarIcon, Wallet, ShoppingCart, Leaf, Landmark, Mountain } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { useUser, useCollection } from '@/firebase';
import type { FirestoreTransaction, Asset, AssetType } from '@/lib/types';
import { useMemo } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Loader2 } from 'lucide-react';

const AssetIcon = ({ type }: { type: AssetType }) => {
    const icons = {
        'carbon-credit': Leaf,
        'tax-credit': Landmark,
        'rural-land': Mountain,
    };
    const Icon = icons[type] || Leaf;
    return <Icon className="h-5 w-5" />;
};


export default function CalendarPage() {
  const { user } = useUser();
  const [selectedDay, setSelectedDay] = React.useState<Date | undefined>(new Date());

  const { data: transactions, loading } = useCollection<FirestoreTransaction>(
    user ? `transactions` : null
  );

  const userTransactions = useMemo(() => {
    if (!transactions || !user) return [];
    return transactions.filter(tx => tx.buyerId === user.uid || tx.sellerId === user.uid);
  }, [transactions, user]);


  const operationDates = useMemo(() => {
    return userTransactions.map(tx => tx.createdAt.toDate());
  }, [userTransactions]);

  const selectedDayOperations = useMemo(() => {
    if (!selectedDay) return [];
    return userTransactions.filter(op => {
        const opDate = op.createdAt.toDate();
        return format(opDate, 'yyyy-MM-dd') === format(selectedDay, 'yyyy-MM-dd');
    });
  }, [userTransactions, selectedDay]);

  return (
    <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8 max-w-7xl">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <CalendarIcon className="h-8 w-8 text-primary" />
                        <div>
                        <CardTitle className="text-3xl font-bold font-headline">Calendário de Operações</CardTitle>
                        <CardDescription>
                            Acompanhe suas transações de compra e venda ao longo do tempo.
                        </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Calendar
                        mode="single"
                        selected={selectedDay}
                        onSelect={setSelectedDay}
                        className="rounded-md border p-4 w-full"
                        modifiers={{
                            operation: operationDates,
                        }}
                        modifiersClassNames={{
                           operation: 'day-with-operation'
                        }}
                    />
                </CardContent>
            </Card>
        </div>
        <div>
            <Card>
                <CardHeader>
                     <CardTitle>Operações do Dia</CardTitle>
                     <CardDescription>
                        {selectedDay ? format(selectedDay, "'Eventos de' dd 'de' MMMM 'de' yyyy", { locale: ptBR }) : 'Selecione um dia'}
                    </CardDescription>
                </CardHeader>
                 <CardContent className="space-y-4 h-[400px] overflow-y-auto">
                    {loading ? (
                         <div className="flex items-center justify-center h-full">
                            <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        </div>
                    ) : selectedDayOperations.length > 0 ? (
                        selectedDayOperations.map(op => {
                            const isSale = op.sellerId === user?.uid;
                            return (
                                <div key={op.id} className="flex items-start gap-4 p-3 rounded-lg bg-secondary/50">
                                    <div className={`p-2 rounded-full ${isSale ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {isSale ? <Wallet className="h-5 w-5" /> : <ShoppingCart className="h-5 w-5" />}
                                    </div>
                                    <div>
                                        <p className="font-semibold">{isSale ? 'Venda Realizada' : 'Compra Efetuada'}</p>
                                        <p className="text-sm text-muted-foreground">Ativo: {(op as any).listing?.title || op.listingId}</p>
                                        <p className="text-sm font-bold">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(op.value)}</p>
                                    </div>
                                    <div className="ml-auto p-2 bg-muted rounded-full">
                                        <AssetIcon type={(op as any).listing?.category || 'carbon-credit'}/>
                                    </div>
                                </div>
                            )
                        })
                    ) : (
                        <div className="text-center py-10 text-muted-foreground">
                            <p>Nenhuma operação neste dia.</p>
                        </div>
                    )}
                 </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
