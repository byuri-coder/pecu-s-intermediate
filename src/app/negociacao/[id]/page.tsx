
import { placeholderCredits, placeholderRuralLands, placeholderTaxCredits } from '@/lib/placeholder-data';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ChevronRight, Landmark, Handshake, ThumbsUp, ThumbsDown, Edit, FileSignature, Upload, Download, Paperclip, Send } from 'lucide-react';
import { NegotiationChat } from './negotiation-chat';
import { Input } from '@/components/ui/input';

type AssetType = 'carbon-credit' | 'tax-credit' | 'rural-land';

function getAssetDetails(id: string, type: AssetType) {
    if (type === 'carbon-credit') {
        return placeholderCredits.find((c) => c.id === id);
    }
    if (type === 'tax-credit') {
        return placeholderTaxCredits.find((c) => c.id === id);
    }
    if (type === 'rural-land') {
        return placeholderRuralLands.find((c) => c.id === id);
    }
    return null;
}

function getAssetTypeName(type: AssetType) {
    switch(type) {
        case 'carbon-credit': return 'Crédito de Carbono';
        case 'tax-credit': return 'Crédito Tributário';
        case 'rural-land': return 'Terra Rural';
    }
}

function getAssetTypeRoute(type: AssetType) {
    switch(type) {
        case 'carbon-credit': return '/credito-de-carbono';
        case 'tax-credit': return '/tributos';
        case 'rural-land': return '/terras-rurais';
    }
}


export default function NegotiationPage({ params, searchParams }: { params: { id: string }, searchParams: { type: AssetType } }) {
  const assetType = searchParams.type || 'carbon-credit';
  const asset = getAssetDetails(params.id, assetType);
  
  if (!asset) {
    notFound();
  }

  const assetName = 'title' in asset ? asset.title : `Crédito de ${'taxType' in asset ? asset.taxType : asset.creditType}`;

  return (
    <div className="container mx-auto max-w-7xl py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center space-x-2 text-sm text-muted-foreground">
        <Link href={getAssetTypeRoute(assetType)} className="hover:text-primary">{getAssetTypeName(assetType)}</Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground">{assetName}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
        {/* Coluna do Chat */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
                <CardTitle>Sala de Negociação</CardTitle>
                <CardDescription>Converse com o vendedor e troque documentos com segurança.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col h-[65vh]">
                    <NegotiationChat />
                    <div className="mt-4 flex items-center gap-2">
                        <Button variant="ghost" size="icon"><Paperclip className="h-5 w-5" /></Button>
                        <Input placeholder="Digite sua mensagem..." />
                        <Button><Send className="h-5 w-5" /></Button>
                    </div>
                     <p className="text-xs text-muted-foreground mt-2 text-center">É possível anexar documentos (PDF) e imagens (JPG, PNG).</p>
                </div>
            </CardContent>
          </Card>
        </div>

        {/* Coluna de Ações */}
        <div className="lg:col-span-1">
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle>Painel de Ações</CardTitle>
              <CardDescription>
                Gerencie a proposta e o contrato.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-3 p-4 border rounded-lg">
                    <h4 className="font-semibold text-center">Proposta</h4>
                    <Button className="w-full bg-green-600 hover:bg-green-700"><ThumbsUp className="mr-2"/> Aceitar Proposta</Button>
                    <Button variant="destructive" className="w-full"><ThumbsDown className="mr-2"/> Rejeitar Proposta</Button>
                    <Button variant="outline" className="w-full"><Edit className="mr-2"/> Ajustar Proposta</Button>
                </div>

                <Separator />
                
                <div className="space-y-3 p-4 border rounded-lg opacity-50 cursor-not-allowed">
                    <h4 className="font-semibold text-center">Contrato</h4>
                    <p className="text-xs text-muted-foreground text-center">A assinatura será liberada após a aceitação da proposta.</p>
                    <Button className="w-full" disabled><FileSignature className="mr-2"/> Assinar Contrato (GOV.BR)</Button>
                    <div className="relative my-2">
                        <Separator />
                        <span className="absolute left-1/2 -translate-x-1/2 -top-2.5 bg-card px-2 text-xs text-muted-foreground">OU</span>
                    </div>
                     <Button variant="secondary" className="w-full" disabled><Download className="mr-2"/> Baixar para Assinar</Button>
                     <Button variant="secondary" className="w-full" disabled><Upload className="mr-2"/> Anexar Contrato Assinado</Button>
                </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
