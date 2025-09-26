
'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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


const carbonCreditContractTemplate = `CONTRATO DE CESSÃO DE CRÉDITOS DE CARBONO

CEDENTE: [NOME/RAZÃO SOCIAL DO CEDENTE], inscrito no [CNPJ/CPF nº DO CEDENTE], com sede/endereço em [ENDERECO DO CEDENTE], neste ato representado por [REPRESENTANTE DO CEDENTE].

CESSIONÁRIO: [NOME/RAZÃO SOCIAL DO CESSIONÁRIO], inscrito no [CNPJ/CPF nº DO CESSIONÁRIO], com sede/endereço em [ENDERECO DO CESSIONÁRIO], neste ato representado por [REPRESENTANTE DO CESSIONÁRIO].

OBJETO: Cessão de Créditos de Carbono no valor de R$ [VALOR_NEGOCIADO].

DATA: [DATA_CONTRATO].

CLÁUSULAS E CONDIÇÕES

Cláusula 1ª – Da Titularidade
O CEDENTE declara ser o legítimo titular e possuidor dos créditos de carbono descritos no sistema [PLATAFORMA_PROJETO], identificados pelo código [ID_ATIVO], cujo valor total corresponde a R$ [VALOR_TOTAL_ATIVO].

Cláusula 2ª – Da Cessão
O CEDENTE cede e transfere ao CESSIONÁRIO, em caráter irrevogável e irretratável, a quantidade de créditos de carbono ora negociada, pelo valor de R$ [VALOR_NEGOCIADO], na forma e condições estabelecidas neste contrato.

Cláusula 3ª – Dos Custos da Plataforma
Os custos operacionais da plataforma, no valor de R$ [CUSTO_PLATAFORMA] ([PERCENTUAL_TAXA]%), serão suportados pelas partes na proporção de [PERCENTUAL_CEDENTE] para o CEDENTE e [PERCENTUAL_CESSIONARIO] para o CESSIONÁRIO.

Cláusula 4ª – Do Pagamento
O CESSIONÁRIO compromete-se a efetuar o pagamento do valor estabelecido na Cláusula 2ª no prazo de até [PRAZO_PAGAMENTO] dias úteis contados da assinatura deste contrato, mediante [FORMA_PAGAMENTO].

Cláusula 5ª – Das Declarações
As partes declaram que:
a) possuem capacidade legal e poderes necessários para celebrar o presente contrato;
b) estão cientes da natureza e condições dos créditos objeto da cessão;
c) concordam expressamente com todos os termos e obrigações aqui previstos.

Cláusula 6ª – Da Legislação Aplicável e Foro
Este contrato será regido pela legislação brasileira. Fica eleito o foro da comarca de [FORO_COMARCA], com renúncia a qualquer outro, para dirimir eventuais conflitos decorrentes deste instrumento.

E por estarem justas e contratadas, as partes assinam o presente contrato em 2 vias de igual teor e forma, na presença de testemunhas.

[LOCAL_ASSINATURA], [DATA_EXTENSO].

CEDENTE: ____________________________________
[NOME/RAZÃO SOCIAL DO CEDENTE]

CESSIONÁRIO: __________________________________
[NOME/RAZÃO SOCIAL DO CESSIONÁRIO]

TESTEMUNHAS:

Nome: _____________________ – CPF: _______________

Nome: _____________________ – CPF: _______________
`;

const ruralLandContractTemplate = `CONTRATO PARTICULAR DE COMPRA E VENDA DE IMÓVEL RURAL

VENDEDOR(ES): [VENDEDOR_NOME], [nacionalidade], [estado civil], [profissão], portador do RG nº [] e CPF nº [], residente e domiciliado em [endereço completo].

COMPRADOR(ES): [COMPRADOR_NOME], [nacionalidade], [estado civil], [profissão], portador do RG nº [] e CPF nº [], residente e domiciliado em [endereço completo].

As partes acima qualificadas têm entre si justo e contratado o presente Contrato Particular de Compra e Venda de Imóvel Rural, que se regerá pelas cláusulas e condições seguintes:

CLÁUSULAS

Cláusula 1ª – Do Objeto
O VENDEDOR é legítimo proprietário e possuidor do imóvel rural denominado [denominação da propriedade], situado no município de [PROPRIEDADE_MUNICIPIO], Estado de [PROPRIEDADE_ESTADO], com área total de [PROPRIEDADE_AREA] hectares, registrado no Cartório de Registro de Imóveis da Comarca de [PROPRIEDADE_COMARCA], sob a matrícula nº [PROPRIEDADE_MATRICULA].

Cláusula 2ª – Do Preço e Forma de Pagamento
O preço certo e ajustado da venda é de R$ [VALOR_NEGOCIADO_NUM], que o COMPRADOR pagará ao VENDEDOR da seguinte forma:
a) [condição de pagamento: à vista / parcelado];
b) [detalhar condições de parcelas, datas, correção monetária e juros, se houver].

Cláusula 3ª – Da Imissão na Posse
A posse será transmitida ao COMPRADOR na data de [data/condição: assinatura, pagamento integral, etc.], desde que cumpridas as condições de pagamento previstas. A partir desta data, o imóvel poderá ser utilizado para exploração rural, respeitadas as normas ambientais e fundiárias.

Cláusula 4ª – Das Obrigações do Vendedor
O VENDEDOR declara e garante que:
a) o imóvel encontra-se livre e desembaraçado de quaisquer ônus, gravames, hipotecas, arrendamentos, servidões ou litígios;
b) está quite com o pagamento do ITR (Imposto Territorial Rural), CCIR (Certificado de Cadastro de Imóvel Rural) e demais obrigações fiscais até a data da assinatura;
c) possui inscrição no CAR (Cadastro Ambiental Rural), a qual será transferida ao COMPRADOR juntamente com a posse do imóvel;
d) não há passivos ambientais, embargos ou restrições legais incidentes sobre a propriedade.

Cláusula 5ª – Das Obrigações do Comprador
O COMPRADOR compromete-se a:
a) efetuar o pagamento integral do preço ajustado nas condições pactuadas;
b) arcar com despesas de escritura, ITBI, registro e demais custos cartorários;
c) providenciar, após a lavratura da escritura, a atualização cadastral do imóvel junto ao INCRA, Receita Federal e demais órgãos competentes;
d) manter a exploração do imóvel em conformidade com a legislação agrária e ambiental.

Cláusula 6ª – Da Escritura Definitiva
Cumpridas as obrigações contratuais, as partes comparecerão ao Cartório de Notas competente para a lavratura da escritura pública de compra e venda e posterior registro no Cartório de Registro de Imóveis.

Cláusula 7ª – Da Responsabilidade Ambiental
As partes reconhecem que o imóvel possui [___ hectares de área de reserva legal / APP / área produtiva], conforme registro no CAR.

O VENDEDOR declara que até a presente data não incorreu em infrações ambientais.

O COMPRADOR assume a responsabilidade de preservar e respeitar as áreas de reserva legal e APP, nos termos do Código Florestal (Lei nº 12.651/2012).

Cláusula 8ª – Da Rescisão e Multa
O inadimplemento de qualquer das partes ensejará a rescisão contratual, mediante notificação, ficando a parte inadimplente sujeita ao pagamento de multa equivalente a [___%] do valor do contrato, além de perdas e danos.

Cláusula 9ª – Da Legislação e Foro
O presente contrato será regido pela legislação brasileira. Fica eleito o foro da comarca de [FORO_COMARCA], com renúncia a qualquer outro, para dirimir eventuais controvérsias.

E por estarem assim justas e contratadas, firmam o presente contrato em [___] vias de igual teor e forma, na presença de testemunhas.

[LOCAL_ASSINATURA], [DATA_EXTENSO].

VENDEDOR(ES): __________________________________

COMPRADOR(ES): __________________________________

TESTEMUNHAS:

Nome: _____________________ – CPF: _______________

Nome: _____________________ – CPF: _______________
`;


// Helper component for file upload display
const FileUploadDisplay = ({
  file,
  onFileChange,
  onClear,
  acceptedTypes,
  maxSize,
  isReadOnly = false,
  label,
}: {
  file: File | null;
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onClear: () => void;
  acceptedTypes: string;
  maxSize: string;
  isReadOnly?: boolean;
  label: string;
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
            {label}
          </p>
        </div>
        <div className="flex items-center">
            <Button variant="ghost" size="icon" onClick={handleView} className="h-7 w-7 text-muted-foreground">
                <Eye className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleDownload} className="h-7 w-7 text-muted-foreground">
                <Download className="h-4 w-4" />
            </Button>
            {!isReadOnly && (
                <Button variant="ghost" size="icon" onClick={onClear} className="h-7 w-7 text-muted-foreground">
                    <X className="h-4 w-4" />
                </Button>
            )}
        </div>
      </div>
    );
  }

  if (isReadOnly) {
    return (
        <div className="flex items-center justify-between p-3 rounded-md border bg-secondary/30 text-muted-foreground">
             <p className="font-semibold text-sm truncate">Nenhum documento anexado.</p>
        </div>
    )
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
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const isArchiveView = searchParams.get('view') === 'archive';
  const platformFeePercentage = 1; // Fixed 1% platform fee

  const [costSplit, setCostSplit] = React.useState('50/50');
  const [sellerAgrees, setSellerAgrees] = React.useState(isArchiveView);
  const [buyerAgrees, setBuyerAgrees] = React.useState(isArchiveView);
  const [isFinalized, setFinalized] = React.useState(isArchiveView);
  const [isTransactionComplete, setTransactionComplete] = React.useState(isArchiveView);


  // For archive view, we can use placeholder file objects. In a real app, these would be fetched.
  const [buyerProofFile, setBuyerProofFile] = React.useState<File | null>(
    isArchiveView ? new File(["comprovante"], "comprovante_pagamento.pdf", { type: "application/pdf" }) : null
  );
  const [sellerProofFile, setSellerProofFile] = React.useState<File | null>(
    isArchiveView ? new File(["transferencia"], "doc_transferencia_ativo.pdf", { type: "application/pdf" }) : null
  );

  const handleFileChange = (setter: React.Dispatch<React.SetStateAction<File | null>>) => (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setter(event.target.files[0]);
       toast({ title: "Arquivo anexado!", description: event.target.files[0].name });
    }
  };

  const id = asset.id;
  const sellerName = 'owner' in asset ? asset.owner : asset.sellerName;
  const negotiatedValue = 'price' in asset ? ('quantity' in asset && asset.quantity ? asset.pricePerCredit * asset.quantity : (asset.price || 0)) : 50000;
  const platformCost = negotiatedValue * (platformFeePercentage / 100);

  // Mock payment data - in a real app, this would be fetched from the seller's profile
  const paymentInfo = {
    bank: "Banco Exemplo S.A.",
    agency: "0001",
    account: "12345-6",
    pixKey: "documento@email.com",
    holder: sellerName,
  };


  const getCostSplitPercentages = () => {
    switch (costSplit) {
      case '50/50': return { seller: '50%', buyer: '50%' };
      case 'seller': return { seller: '100%', buyer: '0%' };
      case 'buyer': return { seller: '0%', buyer: '100%' };
      default: return { seller: '50%', buyer: '50%' };
    }
  };
  
  const getContractTemplate = () => {
    if (assetType === 'rural-land' && 'businessType' in asset && asset.businessType === 'Venda') {
      return ruralLandContractTemplate;
    }
    // Default to carbon credit template for other rural-land types and tax credits as well
    return carbonCreditContractTemplate;
  }

  const getFinalContractText = () => {
    const currentTemplate = getContractTemplate();
    const currentDate = new Date();
    const formattedDate = currentDate.toLocaleDateString('pt-BR');
    const extendedDate = currentDate.toLocaleDateString('pt-BR', { year: 'numeric', month: 'long', day: 'numeric' });

    if (currentTemplate === ruralLandContractTemplate && 'title' in asset) { // It's a RuralLand asset
      const land = asset as RuralLand;
      const [municipio, estado] = land.location.split(',').map(s => s.trim());
      
      return ruralLandContractTemplate
        .replace(/\[VENDEDOR\(ES\): \[NOME\/RAZÃO SOCIAL\], \[nacionalidade\], \[estado civil\], \[profissão\], portador do RG nº \[] e CPF nº \[], residente e domiciliado em \[endereço completo\]\.?]/, `VENDEDOR(ES): ${land.owner}, brasileiro(a), casado(a), produtor(a) rural, portador(a) do RG nº [RG DO VENDEDOR] e CPF nº [CPF DO VENDEDOR], residente e domiciliado(a) em [ENDEREÇO DO VENDEDOR].`)
        .replace(/\[COMPRADOR\(ES\): \[NOME\/RAZÃO SOCIAL\], \[nacionalidade\], \[estado civil\], \[profissão\], portador do RG nº \[] e CPF nº \[], residente e domiciliado em \[endereço completo\]\.?]/, `COMPRADOR(ES): [NOME DO COMPRADOR], [nacionalidade], [estado civil], [profissão], portador(a) do RG nº [RG DO COMPRADOR] e CPF nº [CPF DO COMPRADOR], residente e domiciliado(a) em [ENDEREÇO DO COMPRADOR].`)
        .replace(/\[denominação da propriedade\]/g, land.title)
        .replace(/\[situado no município de \[]/, `situado no município de ${municipio || '[]'}`)
        .replace(/\[Estado de \[]/, `Estado de ${estado || '[]'}`)
        .replace(/\[___ hectares\]/g, land.sizeHa.toLocaleString('pt-BR'))
        .replace(/\[Cartório de Registro de Imóveis da Comarca de \[]/, `Cartório de Registro de Imóveis da Comarca de ${municipio || '[]'}`)
        .replace(/\[matrícula nº \[\]\]/g, `matrícula nº ${land.registration}`)
        .replace(/\[preço certo e ajustado da venda é de R\$ \[__________\]\]/, `preço certo e ajustado da venda é de ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(negotiatedValue)}`)
        .replace(/\[condição de pagamento: à vista \/ parcelado\]/g, 'à vista')
        .replace(/\[detalhar condições de parcelas, datas, correção monetária e juros, se houver\]\./g, 'O pagamento será realizado via transferência bancária (TED ou PIX) para a conta do VENDEDOR informada na plataforma.')
        .replace(/\[A posse será transmitida ao COMPRADOR na data de \[__________\]\]/, `A posse será transmitida ao COMPRADOR na data de assinatura deste instrumento`)
        .replace(/\[___ hectares de área de reserva legal \/ APP \/ área produtiva\]/g, '[INSERIR DADOS DO CAR] hectares de área de reserva legal')
        .replace(/\[multa equivalente a \[___%\] do valor do contrato\]/, `multa equivalente a 10% do valor do contrato`)
        .replace(/\[foro da comarca de \[__________\]\]/g, `foro da comarca de ${municipio || '[]'}`)
        .replace(/\[Cidade\], \[____ de __________ de ____\]\./g, `${municipio || '[Cidade]'}, ${extendedDate}.`)
        .replace(/VENDEDOR\(ES\): __________________________________/, `VENDEDOR(ES): __________________________________\n${land.owner}`)
        .replace(/COMPRADOR\(ES\): __________________________________/, `COMPRADOR(ES): __________________________________\n[NOME DO COMPRADOR]`);
    }
    
    // Default to Carbon Credit / Other contract
    return carbonCreditContractTemplate
      .replace(/\[NOME\/RAZÃO SOCIAL DO CEDENTE\]/g, sellerName)
      .replace(/\[CNPJ\/CPF nº DO CEDENTE\]/g, '00.000.000/0001-00') // Placeholder
      .replace(/\[ENDERECO DO CEDENTE\]/g, 'Rua Fictícia, 123, Cidade Exemplo, UF') // Placeholder
      .replace(/\[REPRESENTANTE DO CEDENTE\]/g, 'Admin da Empresa Cedente') // Placeholder
      .replace(/\[NOME\/RAZÃO SOCIAL DO CESSIONÁRIO\]/g, 'Comprador Exemplo S.A.')
      .replace(/\[CNPJ\/CPF nº DO CESSIONÁRIO\]/g, '11.111.111/0001-11') // Placeholder
      .replace(/\[ENDERECO DO CESSIONÁRIO\]/g, 'Avenida dos Testes, 456, Outra Cidade, UF') // Placeholder
      .replace(/\[REPRESENTANTE DO CESSIONÁRIO\]/g, 'Diretor de Compras') // Placeholder
      .replace(/\[VALOR_NEGOCIADO\]/g, new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(negotiatedValue))
      .replace(/\[DATA_CONTRATO\]/g, formattedDate)
      .replace(/\[PLATAFORMA_PROJETO\]/g, 'standard' in asset ? asset.standard : 'N/A')
      .replace(/\[ID_ATIVO\]/g, asset.id)
      .replace(/\[VALOR_TOTAL_ATIVO\]/g, new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format('amount' in asset && asset.amount ? asset.amount : 'quantity' in asset && asset.quantity ? asset.quantity * asset.pricePerCredit : negotiatedValue))
      .replace(/\[CUSTO_PLATAFORMA\]/g, new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(platformCost))
      .replace(/\[PERCENTUAL_TAXA\]/g, platformFeePercentage.toString())
      .replace(/\[PERCENTUAL_CEDENTE\]/g, getCostSplitPercentages().seller)
      .replace(/\[PERCENTUAL_CESSIONARIO\]/g, getCostSplitPercentages().buyer)
      .replace(/\[PRAZO_PAGAMENTO\]/g, '5') // Placeholder
      .replace(/\[FORMA_PAGAMENTO\]/g, 'Transferência Bancária (PIX ou TED)') // Placeholder
      .replace(/\[FORO_COMARCA\]/g, 'location' in asset ? asset.location : 'São Paulo/SP')
      .replace(/\[LOCAL_ASSINATURA\]/g, 'location' in asset ? asset.location.split(',')[0] : 'São Paulo')
      .replace(/\[DATA_EXTENSO\]/g, extendedDate);
  }

  const finalContractText = getFinalContractText();

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
    
    // RENDER FOR ARCHIVE VIEW
    if (isArchiveView) {
        return (
             <div className="container mx-auto max-w-4xl py-8 px-4 sm:px-6 lg:px-8">
                <div className="mb-6">
                    <Button variant="outline" asChild>
                        <Link href="/dashboard">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Voltar para o Gerenciamento
                        </Link>
                    </Button>
                </div>
                 <Card className="mb-6">
                    <CardHeader>
                      <CardTitle className="text-2xl font-bold font-headline flex items-center gap-3">
                        <FileSignature className="h-7 w-7" />
                        Arquivo da Negociação: {asset.id}
                      </CardTitle>
                      <CardDescription>
                        Esta é uma visualização dos documentos finais da negociação concluída.
                      </CardDescription>
                    </CardHeader>
                </Card>
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Contrato Definitivo</CardTitle>
                        </CardHeader>
                        <CardContent>
                             <div className="h-80 overflow-y-auto whitespace-pre-wrap rounded-md border bg-muted/30 p-4 font-mono text-sm relative">
                                {finalContractText}
                                <div className="absolute bottom-4 right-4 bg-green-100 text-green-800 p-2 rounded-md border border-green-300 text-xs font-semibold">
                                    ✓ Assinado Digitalmente (ICP-Brasil)
                                </div>
                            </div>
                             <div className="flex gap-2 mt-4">
                                <Button onClick={handleDownloadPdf}>
                                    <Download className="mr-2 h-4 w-4" /> Baixar PDF
                                </Button>
                                <Button variant="outline" onClick={handleDownloadDocx}>
                                    <FileText className="mr-2 h-4 w-4" /> Baixar DOCX
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Documentos Comprobatórios</CardTitle>
                        </CardHeader>
                        <CardContent className="grid md:grid-cols-2 gap-6">
                            <div>
                                <h3 className="font-semibold mb-2">Comprovação do Comprador</h3>
                                <FileUploadDisplay
                                    file={buyerProofFile}
                                    label="comprovante_pagamento.pdf"
                                    onFileChange={() => {}}
                                    onClear={() => {}}
                                    acceptedTypes=""
                                    maxSize=""
                                    isReadOnly={true}
                                />
                            </div>
                            <div>
                                <h3 className="font-semibold mb-2">Comprovação do Vendedor</h3>
                                <FileUploadDisplay
                                    file={sellerProofFile}
                                    label="doc_transferencia_ativo.pdf"
                                    onFileChange={() => {}}
                                    onClear={() => {}}
                                    acceptedTypes=""
                                    maxSize=""
                                    isReadOnly={true}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>
             </div>
        )
    }

  // RENDER FOR ACTIVE ADJUSTMENT
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
                        <span className="font-medium text-secondary-foreground">Custo ({platformFeePercentage}%)</span>
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
                            label="comprovante_pagamento.pdf"
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
                            label="doc_transferencia_ativo.pdf"
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
