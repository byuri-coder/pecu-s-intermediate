'use client';

import * as React from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { FileText, Users, VenetianMask } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import type { Duplicata, CompletedDeal } from '@/lib/types';
import { numberToWords } from '@/lib/number-to-words';
import { Separator } from '@/components/ui/separator';

const DUPLICATAS_STORAGE_KEY = 'completed_deals_with_duplicates';

const mockDeal: CompletedDeal = {
  assetId: "tax-001-mock",
  assetName: "Saldo Credor de ICMS (Exemplo)",
  duplicates: [
    {
      orderNumber: "001/1",
      invoiceNumber: "000001",
      issueDate: new Date().toLocaleDateString('pt-BR'),
      dueDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toLocaleDateString('pt-BR'),
      value: 110000
    }
  ],
  seller: {
    name: "Indústria Têxtil Fios de Ouro",
    doc: "11.111.111/0001-11",
    address: "Rua do Cedente, 123, São Paulo, SP"
  },
  buyer: {
    name: "Comprador Fictício Ltda.",
    doc: "22.222.222/0001-22",
    address: "Avenida do Cessionário, 456, Campinas, SP"
  }
};

const mockDealParcelado: CompletedDeal = {
  assetId: "land-005-mock",
  assetName: "Arrendamento Fazenda Boa Safra (Parcelado)",
  duplicates: [
    {
      orderNumber: "001/002",
      invoiceNumber: "000002",
      issueDate: new Date().toLocaleDateString('pt-BR'),
      dueDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toLocaleDateString('pt-BR'),
      value: 2400000
    },
    {
      orderNumber: "002/002",
      invoiceNumber: "000002",
      issueDate: new Date().toLocaleDateString('pt-BR'),
      dueDate: new Date(new Date().setMonth(new Date().getMonth() + 2)).toLocaleDateString('pt-BR'),
      value: 2400000
    }
  ],
  seller: {
    name: "Agropecuária Sol Nascente",
    doc: "33.333.333/0001-33",
    address: "Zona Rural, 789, Primavera do Leste, MT"
  },
  buyer: {
    name: "Grãos & Cia Exportação",
    doc: "44.444.444/0001-44",
    address: "Avenida do Porto, 101, Santos, SP"
  }
};


export default function DuplicatasPage() {
  const [completedDeals, setCompletedDeals] = React.useState<CompletedDeal[]>([mockDeal, mockDealParcelado]);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedDeals = window.localStorage.getItem(DUPLICATAS_STORAGE_KEY);
      if (storedDeals) {
        // Combine mock data with stored data, ensuring no duplicates if mock is already there
        const parsedDeals: CompletedDeal[] = JSON.parse(storedDeals);
        const allDealIds = new Set([...parsedDeals.map(d => d.assetId), mockDeal.assetId, mockDealParcelado.assetId]);
        const allDeals = Array.from(allDealIds).map(id => {
            if (id === mockDeal.assetId) return mockDeal;
            if (id === mockDealParcelado.assetId) return mockDealParcelado;
            return parsedDeals.find(d => d.assetId === id)!;
        });
        setCompletedDeals(allDeals);
      }
    }
  }, []);

  return (
    <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8 max-w-5xl">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <FileText className="h-8 w-8 text-primary" />
            <div>
              <CardTitle className="text-3xl font-bold font-headline">
                Duplicatas de Compra/Venda
              </CardTitle>
              <CardDescription>
                Visualize as duplicatas geradas a partir de seus negócios concluídos.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {completedDeals.length > 0 ? (
            <Accordion type="single" collapsible className="w-full space-y-4">
              {completedDeals.map((deal) => (
                <AccordionItem value={deal.assetId} key={deal.assetId}>
                  <AccordionTrigger className="p-4 bg-secondary/30 rounded-lg hover:bg-secondary/50">
                    <div className="flex items-center gap-4 text-left">
                       <Users className="h-6 w-6 text-primary flex-shrink-0"/>
                       <div>
                            <p className="font-semibold">{deal.assetName}</p>
                            <p className="text-sm text-muted-foreground">
                                Vendedor: {deal.seller.name} <span className="mx-2">/</span> Comprador: {deal.buyer.name}
                            </p>
                       </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="p-4 border border-t-0 rounded-b-lg">
                    {deal.duplicates.map((dup, index) => (
                      <Card key={index} className="bg-background overflow-hidden mb-4">
                        <CardHeader className="bg-muted p-4">
                          <CardTitle className="text-lg">
                            DM - DUPLICATA DE VENDA MERCANTIL
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 space-y-4">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div><span className="font-semibold block">Nº de Ordem:</span>{dup.orderNumber}</div>
                            <div><span className="font-semibold block">Nº da Fatura:</span>{dup.invoiceNumber}</div>
                            <div><span className="font-semibold block">Data Emissão:</span>{dup.issueDate}</div>
                            <div><span className="font-semibold block">Data Vencimento:</span>{dup.dueDate}</div>
                          </div>
                          <div className="text-center p-4 border rounded-lg">
                            <p className="text-sm text-muted-foreground">Valor do Título</p>
                            <p className="text-2xl font-bold text-primary">
                              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(dup.value)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {numberToWords(dup.value)}
                            </p>
                          </div>
                          <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-1">
                              <h4 className="font-semibold">SACADOR (Vendedor)</h4>
                              <p className="text-sm">{deal.seller.name}</p>
                              <p className="text-xs text-muted-foreground">{deal.seller.doc}</p>
                              <p className="text-xs text-muted-foreground">{deal.seller.address}</p>
                            </div>
                            <div className="space-y-1">
                              <h4 className="font-semibold">SACADO (Comprador)</h4>
                              <p className="text-sm">{deal.buyer.name}</p>
                              <p className="text-xs text-muted-foreground">{deal.buyer.doc}</p>
                              <p className="text-xs text-muted-foreground">{deal.buyer.address}</p>
                            </div>
                          </div>
                           <Separator />
                           <div className="text-center text-xs italic text-muted-foreground">
                             RECONHEÇO(EMOS) A EXATIDÃO DESTA DUPLICATA DE VENDA MERCANTIL, NA IMPORTÂNCIA ACIMA, QUE PAGAREI(EMOS) AO SACADOR OU À SUA ORDEM, NA PRAÇA E VENCIMENTO INDICADOS.
                           </div>
                        </CardContent>
                      </Card>
                    ))}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
            <div className="text-center py-12 border-2 border-dashed rounded-lg">
              <p className="text-muted-foreground">Nenhuma duplicata encontrada.</p>
              <p className="text-sm text-muted-foreground">As duplicatas de negócios concluídos aparecerão aqui.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
