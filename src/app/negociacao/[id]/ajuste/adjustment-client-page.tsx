
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, FileSignature, CheckCircle, XCircle, Copy, Banknote } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import type { CarbonCredit, RuralLand, TaxCredit } from '@/lib/types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

type AssetType = 'carbon-credit' | 'tax-credit' | 'rural-land';
type Asset = CarbonCredit | TaxCredit | RuralLand;


const contractTemplate = `CONTRATO DE CESSÃO DE CRÉDITOS

CEDENTE: [VENDEDOR]
CESSIONÁRIO: [COMPRADOR]
OBJETO: Cessão de [TIPO_ATIVO] no valor de [VALOR_NEGOCIADO].
DATA: ${new Date().toLocaleDateString('pt-BR')}

Pelo presente instrumento particular, as partes acima qualificadas resolvem celebrar o presente Contrato de Cessão de Créditos, que se regerá pelas seguintes cláusulas e condições:

Cláusula 1ª - O CEDENTE declara ser o legítimo titular e possuidor do ativo [TIPO_ATIVO], com ID [ID_ATIVO], no valor total de [VALOR_ATIVO].

Cláusula 2ª - O CEDENTE cede e transfere ao CESSIONÁRIO a totalidade do referido crédito, pelo valor negociado de [VALOR_NEGOCIADO].

Cláusula 3ª - Os custos da plataforma, no valor de [CUSTO_PLATAFORMA], serão divididos da seguinte forma: [DIVISAO_CUSTOS].

Cláusula 4ª - O CESSIONÁRIO efetuará o pagamento do valor negociado em até 5 (cinco) dias úteis após a assinatura deste contrato.

Cláusula 5ª - Ambas as partes declaram, sob as penas da lei, que concordam com todos os termos aqui presentes.

E por estarem justos e contratados, assinam o presente instrumento em duas vias de igual teor e forma.
`;

export function AdjustmentClientPage({ asset, assetType }: { asset: Asset, assetType: AssetType }) {
  const router = useRouter();
  const { toast } = useToast();

  const [costSplit, setCostSplit] = React.useState('50/50');
  const [sellerAgrees, setSellerAgrees] = React.useState(false);
  const [buyerAgrees, setBuyerAgrees] = React.useState(false);
  const [isFinalized, setFinalized] = React.useState(false);

  const id = asset.id;
  const sellerName = 'owner' in asset ? asset.owner : asset.sellerName;
  const negotiatedValue = 'price' in asset ? ('quantity' in asset && asset.quantity ? asset.pricePerCredit * asset.quantity : asset.price) : 50000;
  const platformCost = negotiatedValue * 0.01;

  // Mock payment data - in a real app, this would be fetched from the seller's profile
  const paymentInfo = {
    bank: "Banco Exemplo S.A.",
    agency: "0001",
    account: "12345-6",
    pixKey: "documento@email.com",
    holder: sellerName,
  };


  const getDivisionDescription = () => {
    switch(costSplit) {
        case '50/50': return '50% para o Vendedor, 50% para o Comprador';
        case 'seller': return '100% para o Vendedor';
        case 'buyer': return '100% para o Comprador';
        default: return '';
    }
  }
  
  const finalContractText = contractTemplate
    .replace('[VENDEDOR]', sellerName)
    .replace('[COMPRADOR]', 'Comprador Exemplo S.A.')
    .replace(/\[TIPO_ATIVO\]/g, assetType === 'carbon-credit' ? 'Crédito de Carbono' : assetType === 'tax-credit' ? 'Crédito Tributário' : 'Terra Rural')
    .replace(/\[VALOR_NEGOCIADO\]/g, new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(negotiatedValue))
    .replace('[ID_ATIVO]', asset.id)
    .replace('[VALOR_ATIVO]', new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format('amount' in asset && asset.amount ? asset.amount : 'quantity' in asset && asset.quantity ? asset.quantity * asset.pricePerCredit : negotiatedValue))
    .replace('[CUSTO_PLATAFORMA]', new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(platformCost))
    .replace('[DIVISAO_CUSTOS]', getDivisionDescription());

    const handleFinalize = () => {
        toast({
            title: "Contrato Finalizado!",
            description: "O contrato foi assinado e a negociação concluída.",
        });
        setFinalized(true);
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }
    
    const copyToClipboard = (text: string, fieldName: string) => {
        navigator.clipboard.writeText(text);
        toast({
            title: `${fieldName} copiado!`,
            description: `O valor foi copiado para a área de transferência.`
        });
    }

  return (
    <div className="container mx-auto max-w-7xl py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <Button variant="ghost" asChild>
            <Link href={`/negociacao/${id}?type=${assetType}`}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar para a Negociação
            </Link>
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold font-headline flex items-center gap-3">
            <FileSignature className="h-8 w-8" />
            Ajuste e Assinatura do Contrato
          </CardTitle>
          <CardDescription>
            Revise os termos, defina os custos e finalize a negociação.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Pré-visualização do Contrato</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-96 overflow-y-auto whitespace-pre-wrap rounded-md border bg-muted/30 p-4 font-mono text-sm">
                        {finalContractText}
                    </div>
                </CardContent>
            </Card>
          </div>
          <div className="lg:col-span-2 space-y-6">
             <Card>
                <CardHeader>
                    <CardTitle>Custos da Plataforma</CardTitle>
                    <CardDescription>Defina como os custos da transação serão divididos.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div className="flex justify-between items-center bg-secondary p-4 rounded-md">
                        <span className="font-medium text-secondary-foreground">Custo (1%)</span>
                        <span className="text-2xl font-bold text-primary">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(platformCost)}
                        </span>
                    </div>
                    <RadioGroup value={costSplit} onValueChange={setCostSplit}>
                        <Label>Divisão do Custo</Label>
                        <div className="space-y-2 pt-2">
                             <div className="flex items-center space-x-2">
                                <RadioGroupItem value="50/50" id="50-50" />
                                <Label htmlFor="50-50">50% / 50%</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="seller" id="seller" />
                                <Label htmlFor="seller">Vendedor 100%</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="buyer" id="buyer" />
                                <Label htmlFor="buyer">Comprador 100%</Label>
                            </div>
                        </div>
                    </RadioGroup>
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle>Acordo Mútuo</CardTitle>
                    <CardDescription>Ambas as partes devem concordar com os termos para finalizar.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className={cn("flex items-center justify-between p-3 rounded-md transition-colors", sellerAgrees ? 'bg-green-100' : 'bg-secondary/40')}>
                        <div className="flex items-center space-x-2">
                            <Checkbox id="seller-agrees" checked={sellerAgrees} onCheckedChange={(checked) => setSellerAgrees(!!checked)} />
                            <Label htmlFor="seller-agrees" className="font-medium">Vendedor aceita os termos</Label>
                        </div>
                        {sellerAgrees ? <CheckCircle className="h-5 w-5 text-green-600" /> : <XCircle className="h-5 w-5 text-muted-foreground" />}
                    </div>
                    <div className={cn("flex items-center justify-between p-3 rounded-md transition-colors", buyerAgrees ? 'bg-green-100' : 'bg-secondary/40')}>
                        <div className="flex items-center space-x-2">
                            <Checkbox id="buyer-agrees" checked={buyerAgrees} onCheckedChange={(checked) => setBuyerAgrees(!!checked)} />
                            <Label htmlFor="buyer-agrees" className="font-medium">Comprador aceita os termos</Label>
                        </div>
                        {buyerAgrees ? <CheckCircle className="h-5 w-5 text-green-600" /> : <XCircle className="h-5 w-5 text-muted-foreground" />}
                    </div>
                </CardContent>
            </Card>
             <Button 
                size="lg" 
                className="w-full" 
                disabled={!sellerAgrees || !buyerAgrees || isFinalized}
                onClick={handleFinalize}
            >
                {sellerAgrees && buyerAgrees ? <CheckCircle className="mr-2 h-5 w-5"/> : null}
                {isFinalized ? 'Contrato Assinado' : 'Aceitar e Assinar Contrato'}
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {isFinalized && (
        <Alert className="mt-8 border-green-600 bg-green-50 text-green-900">
            <Banknote className="h-4 w-4 !text-green-900" />
            <AlertTitle>Ação Necessária: Pagamento</AlertTitle>
            <AlertDescription>
                <p>O contrato foi assinado! Para concluir a transação, o comprador deve agora realizar a transferência no valor de <strong>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(negotiatedValue)}</strong> para o vendedor utilizando os dados abaixo. Após a confirmação, o ativo será transferido.</p>
                <Card className="mt-4 bg-white/70">
                    <CardHeader>
                        <CardTitle className="text-base">Dados para Pagamento - {paymentInfo.holder}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                        <div className="flex justify-between items-center"><span><strong>Banco:</strong> {paymentInfo.bank}</span></div>
                        <div className="flex justify-between items-center"><span><strong>Agência:</strong> {paymentInfo.agency}</span></div>
                        <div className="flex justify-between items-center"><span><strong>Conta:</strong> {paymentInfo.account}</span></div>
                        <div className="flex justify-between items-center">
                            <span><strong>Chave PIX:</strong> {paymentInfo.pixKey}</span>
                            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => copyToClipboard(paymentInfo.pixKey, 'Chave PIX')}>
                                <Copy className="h-4 w-4" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </AlertDescription>
        </Alert>
      )}

    </div>
  );
}
