'use client';

import * as React from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { FileText, Users, VenetianMask, FilePlus, ChevronDown, Download } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import type { Duplicata, CompletedDeal } from '@/lib/types';
import { numberToWords } from '@/lib/number-to-words';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import jsPDF from 'jspdf';
import 'jspdf-autotable';


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
      orderNumber: "001/2",
      invoiceNumber: "000002",
      issueDate: new Date().toLocaleDateString('pt-BR'),
      dueDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toLocaleDateString('pt-BR'),
      value: 2400000
    },
    {
      orderNumber: "002/2",
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

  const handleDownloadPdf = (deal: CompletedDeal) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPos = 15;

    doc.setFontSize(18);
    doc.text(`Duplicatas do Negócio: ${deal.assetName}`, pageWidth / 2, yPos, { align: 'center' });
    yPos += 15;

    const isParcelado = deal.duplicates.length > 1;
    if (isParcelado) {
        const totalValue = deal.duplicates.reduce((acc, dup) => acc + dup.value, 0);
        (doc as any).autoTable({
            startY: yPos,
            theme: 'striped',
            headStyles: { fillColor: [22, 163, 74] },
            head: [['Resumo da Fatura']],
            body: [
                ['Valor Total', new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalValue)],
                ['Nº de Parcelas', deal.duplicates.length.toString()],
                ['Fatura Ref.', deal.duplicates[0].invoiceNumber]
            ],
        });
        yPos = (doc as any).autoTable.previous.finalY + 10;
    }

    deal.duplicates.forEach((dup, index) => {
        if (index > 0) yPos += 10;
        doc.setFontSize(14);
        doc.text(`Duplicata de Venda Mercantil (DM) - Parcela ${dup.orderNumber}`, 14, yPos);
        yPos += 8;

        const tableBody = [
            ['Nº de Ordem:', dup.orderNumber],
            ['Nº da Fatura:', dup.invoiceNumber],
            ['Data Emissão:', dup.issueDate],
            ['Data Vencimento:', dup.dueDate],
            [{ content: 'Valor:', styles: { fontStyle: 'bold' } }, { content: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(dup.value), styles: { fontStyle: 'bold' } }],
            [{ content: 'Valor por Extenso:', colSpan: 2, styles: { fontStyle: 'italic', fontSize: 8 } }],
            [{ content: numberToWords(dup.value), colSpan: 2, styles: { fontSize: 8 } }],
            [{ content: 'SACADOR (Vendedor)', colSpan: 2, styles: { fontStyle: 'bold', fillColor: '#f2f2f2' } }],
            ['Razão Social:', deal.seller.name],
            ['CNPJ/CPF:', deal.seller.doc],
            ['Endereço:', deal.seller.address],
            [{ content: 'SACADO (Comprador)', colSpan: 2, styles: { fontStyle: 'bold', fillColor: '#f2f2f2' } }],
            ['Razão Social:', deal.buyer.name],
            ['CNPJ/CPF:', deal.buyer.doc],
            ['Endereço:', deal.buyer.address],
        ];

        (doc as any).autoTable({
            startY: yPos,
            theme: 'grid',
            body: tableBody,
            didDrawPage: (data: any) => { yPos = data.cursor.y }
        });
        yPos = (doc as any).autoTable.previous.finalY;

         yPos += 5;
        (doc as any).autoTable({
            startY: yPos,
            theme: 'plain',
            body: [[{ content: 'RECONHEÇO(EMOS) A EXATIDÃO DESTA DUPLICATA DE VENDA MERCANTIL...', styles: { fontStyle: 'italic', fontSize: 7, halign: 'center' } }]],
            didDrawPage: (data: any) => { yPos = data.cursor.y }
        });
        yPos = (doc as any).autoTable.previous.finalY;
    });


    doc.save(`duplicatas_${deal.assetId}.pdf`);
  };

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
              {completedDeals.map((deal) => {
                const isParcelado = deal.duplicates.length > 1;
                const totalValue = deal.duplicates.reduce((acc, dup) => acc + dup.value, 0);
                
                return (
                <AccordionItem value={deal.assetId} key={deal.assetId}>
                  <AccordionTrigger className="p-4 bg-secondary/30 rounded-lg hover:bg-secondary/50">
                    <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-4 text-left">
                           <Users className="h-6 w-6 text-primary flex-shrink-0"/>
                           <div>
                                <p className="font-semibold">{deal.assetName}</p>
                                <p className="text-sm text-muted-foreground">
                                    Vendedor: {deal.seller.name} <span className="mx-2">/</span> Comprador: {deal.buyer.name}
                                </p>
                           </div>
                        </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="p-4 border border-t-0 rounded-b-lg space-y-4">
                     <Button onClick={() => handleDownloadPdf(deal)} size="sm" variant="outline">
                        <Download className="mr-2 h-4 w-4" />
                        Baixar PDF
                    </Button>
                    {isParcelado && (
                        <Card className="bg-blue-50 border-blue-200">
                             <CardHeader className="p-4">
                                <CardTitle className="text-md text-blue-800">Resumo da Fatura</CardTitle>
                             </CardHeader>
                             <CardContent className="p-4 pt-0 grid grid-cols-3 gap-4 text-center">
                                 <div>
                                     <p className="text-sm font-semibold text-blue-700">Valor Total</p>
                                     <p className="text-lg font-bold text-blue-900">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalValue)}</p>
                                 </div>
                                 <div>
                                     <p className="text-sm font-semibold text-blue-700">Nº de Parcelas</p>
                                     <p className="text-lg font-bold text-blue-900">{deal.duplicates.length}</p>
                                 </div>
                                 <div>
                                     <p className="text-sm font-semibold text-blue-700">Fatura Ref.</p>
                                     <p className="text-lg font-bold text-blue-900">{deal.duplicates[0].invoiceNumber}</p>
                                 </div>
                             </CardContent>
                        </Card>
                    )}
                    {deal.duplicates.map((dup, index) => (
                      <Card key={index} className="bg-background overflow-hidden">
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
                )
            })}
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

    