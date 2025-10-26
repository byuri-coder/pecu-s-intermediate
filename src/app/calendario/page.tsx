
'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Calendar } from 'lucide-react';


export default function CalendarPage() {
  
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
            <div className="text-center py-20 text-muted-foreground">
                <p>A funcionalidade do calendário foi removida.</p>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
