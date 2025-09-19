
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, FileSignature, CheckCircle, XCircle, Copy, Banknote, Download, FileText, FileDown, UploadCloud, X, Eye, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import type { CarbonCredit, RuralLand, TaxCredit } from '@/lib/types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Input } from '@/components/ui/input';


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

// Helper component for file upload display
const FileUploadDisplay = ({
  file,
  onFileChange,
  onClear,
  acceptedTypes,
  maxSize,
}: {
  file: File | null;
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onClear: () => void;
  acceptedTypes: string;
  maxSize: string;
}) => {
  const inputRef = React.useRef<HTMLInputElement>(null);
  
  const handleDownload = () => {
    if (file) {
      const url = URL.createObjectURL(file);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const handleView = () => {
     if (file) {
      const url = URL.createObjectURL(file);
      window.open(url, '_blank');
    }
  }

  if (file) {
    return (
      <div className="flex items-center justify-between p-3 rounded-md border bg-secondary/30">
        <div className="flex items-center gap-3 overflow-hidden">
          <FileText className="h-6 w-6 text-primary flex-shrink-0" />
          <p className="font-semibold text-sm truncate" title={file.name}>
            {file.name}
          </p>
        </div>
        <div className="flex items-center">
            <Button variant="ghost" size="icon" onClick={handleView} className="h-7 w-7 text-muted-foreground">
                <Eye className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleDownload} className="h-7 w-7 text-muted-foreground">
                <Download className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onClear} className="h-7 w-7 text-muted-foreground">
                <X className="h-4 w-4" />
            </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="border-2 border-dashed border-muted-foreground/50 rounded-lg p-12 text-center cursor-pointer hover:bg-secondary transition-colors"
      onClick={() => inputRef.current?.click()}
    >
      <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
      <p className="mt-4 text-sm text-muted-foreground">Arraste ou clique para fazer upload</p>
      <p className="text-xs text-muted-foreground/70">{acceptedTypes} (máx. {maxSize})</p>
      <Input
        ref={inputRef}
        type="file"
        className="hidden"
        onChange={onFileChange}
        accept={acceptedTypes}
      />
    </div>
  );
};


export function AdjustmentClientPage({ asset, assetType }: { asset: Asset, assetType: AssetType }) {
  const router = useRouter();
  const { toast } = useToast();

  const [costSplit, setCostSplit] = React.useState('50/50');
  const [sellerAgrees, setSellerAgrees] = React.useState(false);
  const [buyerAgrees, setBuyerAgrees] = React.useState(false);
  const [isFinalized, setFinalized] = React.useState(false);
  const [isTransactionComplete, setTransactionComplete] = React.useState(false);

  const [buyerProofFile, setBuyerProofFile] = React.useState<File | null>(null);
  const [sellerProofFile, setSellerProofFile] = React.useState<File | null>(null);

  const handleFileChange = (setter: React.Dispatch<React.SetStateAction<File | null>>) => (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setter(event.target.files[0]);
       toast({ title: "Arquivo anexado!", description: event.target.files[0].name });
    }
  };


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

    const handleDownloadPdf = () => {
        try {
            const doc = new jsPDF('p', 'pt', 'a4');
            const margin = 40;
            const contentWidth = doc.internal.pageSize.getWidth() - margin * 2;
            const splitText = doc.splitTextToSize(finalContractText, contentWidth);
            doc.text(splitText, margin, margin);
            doc.save('contrato_assinado.pdf');
        } catch (error) {
            console.error("Failed to generate PDF", error);
            toast({ title: "Erro ao Gerar PDF", variant: "destructive" });
        }
    }

    const handleDownloadDocx = () => {
        const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Contrato</title></head><body>";
        const footer = "</body></html>";
        const sourceHTML = header + '<pre>' + finalContractText + '</pre>' + footer;
        
        const source = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(sourceHTML);
        const fileDownload = document.createElement("a");
        document.body.appendChild(fileDownload);
        fileDownload.href = source;
        fileDownload.download = 'contrato_assinado.doc';
        fileDownload.click();
        document.body.removeChild(fileDownload);
        toast({ title: "Download do DOC iniciado!" });
    }

    const handleFinishTransaction = () => {
        // Here you would typically save all data and files to your backend.
        setTransactionComplete(true);
        toast({
            title: "Transação Finalizada e Salva!",
            description: "Todos os documentos foram salvos. Você será redirecionado.",
        });
        setTimeout(() => {
            router.push('/dashboard?tab=history');
        }, 2000);
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
                    <RadioGroup value={costSplit} onValueChange={setCostSplit} disabled={isFinalized}>
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
                            <Checkbox id="seller-agrees" checked={sellerAgrees} onCheckedChange={(checked) => setSellerAgrees(!!checked)} disabled={isFinalized} />
                            <Label htmlFor="seller-agrees" className="font-medium">Vendedor aceita os termos</Label>
                        </div>
                        {sellerAgrees ? <CheckCircle className="h-5 w-5 text-green-600" /> : <XCircle className="h-5 w-5 text-muted-foreground" />}
                    </div>
                    <div className={cn("flex items-center justify-between p-3 rounded-md transition-colors", buyerAgrees ? 'bg-green-100' : 'bg-secondary/40')}>
                        <div className="flex items-center space-x-2">
                            <Checkbox id="buyer-agrees" checked={buyerAgrees} onCheckedChange={(checked) => setBuyerAgrees(!!checked)} disabled={isFinalized} />
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
                {isFinalized ? <Lock className="mr-2 h-5 w-5"/> : <CheckCircle className="mr-2 h-5 w-5"/>}
                {isFinalized ? 'Contrato Assinado' : 'Aceitar e Assinar Contrato'}
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {isFinalized && (
        <div className="mt-8 space-y-6">
            <Alert className="border-green-600 bg-green-50 text-green-900">
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

            <Card>
                <CardHeader>
                    <CardTitle>Contrato Definitivo</CardTitle>
                    <CardDescription>Este é o contrato final assinado digitalmente via ICP-Brasil.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-80 overflow-y-auto whitespace-pre-wrap rounded-md border bg-muted/30 p-4 font-mono text-sm relative">
                        {finalContractText}
                        <div className="absolute bottom-4 right-4 bg-green-100 text-green-800 p-2 rounded-md border border-green-300 text-xs font-semibold">
                            ✓ Assinado Digitalmente (ICP-Brasil)
                        </div>
                    </div>
                </CardContent>
                <CardContent>
                    <div className="flex gap-2">
                        <Button onClick={handleDownloadPdf}>
                            <Download className="mr-2 h-4 w-4" /> Baixar PDF
                        </Button>
                         <Button variant="outline" onClick={handleDownloadDocx}>
                            <FileText className="mr-2 h-4 w-4" /> Baixar DOCX
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Comprovação do Comprador</CardTitle>
                        <CardDescription>Anexe o comprovante de pagamento para o vendedor liberar o ativo.</CardDescription>
                    </CardHeader>
                    <CardContent>
                       <FileUploadDisplay
                            file={buyerProofFile}
                            onFileChange={handleFileChange(setBuyerProofFile)}
                            onClear={() => setBuyerProofFile(null)}
                            acceptedTypes="PDF, JPG, PNG"
                            maxSize="10MB"
                        />
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Comprovação do Vendedor</CardTitle>
                        <CardDescription>Anexe o documento que comprova a transferência da titularidade do ativo.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <FileUploadDisplay
                            file={sellerProofFile}
                            onFileChange={handleFileChange(setSellerProofFile)}
                            onClear={() => setSellerProofFile(null)}
                            acceptedTypes="PDF, DOCX, ZIP"
                            maxSize="25MB"
                        />
                    </CardContent>
                </Card>
            </div>
            <div className="flex justify-end">
                <Button 
                    size="lg"
                    disabled={!buyerProofFile || !sellerProofFile || isTransactionComplete}
                    onClick={handleFinishTransaction}
                >
                    {isTransactionComplete ? 'Transação Salva' : 'Finalizar Transação'}
                </Button>
            </div>
        </div>
      )}

    </div>
  );
}
