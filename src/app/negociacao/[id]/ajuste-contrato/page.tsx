
'use client';

import type { Asset, AssetType, CompletedDeal, UserProfile } from '@/lib/types';
import { notFound, useParams, useSearchParams } from 'next/navigation';
import * as React from 'react';
import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';
import { useUser } from '@/firebase';
import { getContractTemplate } from '@/lib/contract-template';
import { numberToWords } from '@/lib/number-to-words';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Seal } from '@/components/ui/seal';
import jsPDF from 'jspdf';
import { Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

async function getAssetDetails(id: string, type: AssetType): Promise<Asset | null> {
  try {
    const response = await fetch(`/api/anuncios/get/${id}`, { cache: 'no-store' });
    if (!response.ok) {
      console.error(`Failed to fetch asset ${id}, status: ${response.status}`);
      return null;
    }
    const data = await response.json();
    if (data.ok && data.anuncio.tipo === type) {
        const anuncio = data.anuncio;
        return {
            ...anuncio.metadados,
            id: anuncio._id,
            ownerId: anuncio.uidFirebase,
            title: anuncio.titulo,
            description: anuncio.descricao,
            status: anuncio.status,
            price: anuncio.price,
            pricePerCredit: anuncio.price, 
            images: anuncio.imagens || [],
            createdAt: anuncio.createdAt,
        } as Asset;
    }
    return null;
  } catch (error) {
    console.error("Failed to fetch asset details", error);
    return null;
  }
}

const AdjustmentClientPage = dynamic(
  () => import('./adjustment-client-page'),
  { 
    ssr: false,
    loading: () => (
        <div className="flex h-screen w-full items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin" />
        </div>
    )
  }
);


export default function AdjustmentPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id ?? '';
  const assetType = (searchParams?.get('type') as AssetType);

  const [asset, setAsset] = React.useState<Asset | null | 'loading'>('loading');
  const [contract, setContract] = React.useState<any>(null);
  const [generatedDeal, setGeneratedDeal] = React.useState<CompletedDeal | null>(null);
  const [parties, setParties] = React.useState<{ seller: UserProfile | null, buyer: UserProfile | null }>({ seller: null, buyer: null });

  const { user } = useUser();
  const negotiationId = `neg_${id}`;

  const fetchPartiesInfo = React.useCallback(async (sellerId: string, buyerId: string) => {
    try {
        const [sellerRes, buyerRes] = await Promise.all([
            fetch(`/api/usuarios/get/${sellerId}`),
            fetch(`/api/usuarios/get/${buyerId}`)
        ]);
        const sellerData = await sellerRes.json();
        const buyerData = await buyerRes.json();
        
        setParties({
            seller: sellerData.ok ? sellerData.usuario : null,
            buyer: buyerData.ok ? buyerData.usuario : null
        });

    } catch (e) {
        console.error("Failed to fetch party info", e);
    }
  }, []);

  const loadContract = React.useCallback(async () => {
      if (!user || !asset || asset === 'loading') {
          return;
      }
      try {
        const response = await fetch(`/api/negociacao/get-or-create-contract?negotiationId=${negotiationId}`);
        const data = await response.json();
        
        if (response.ok && data.ok) {
            setContract(data.contract);
            fetchPartiesInfo(data.contract.sellerId, data.contract.buyerId);
        } else if (response.status === 404) {
            const createResponse = await fetch('/api/negociacao/get-or-create-contract', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    negotiationId,
                    buyerId: user.uid,
                    sellerId: 'ownerId' in asset ? asset.ownerId : '',
                    anuncioId: id,
                })
            });
            const createData = await createResponse.json();
             if (createData.ok) {
                setContract(createData.contract);
                fetchPartiesInfo(createData.contract.sellerId, createData.contract.buyerId);
            } else {
                throw new Error(createData.error || "Falha ao criar contrato");
            }
        } else {
            throw new Error(data.error || "Falha ao carregar contrato");
        }
      } catch (error: any) {
        console.error(error);
        setContract(null);
      }
  }, [negotiationId, user, asset, id, fetchPartiesInfo]);

  React.useEffect(() => {
    if (id && assetType) {
        getAssetDetails(id, assetType).then(setAsset);
    } else {
        setAsset(null);
    }
  }, [id, assetType]);

  React.useEffect(() => {
    if(asset && asset !== 'loading' && user) {
        loadContract();
    }
  }, [asset, user, loadContract]);

  const contractPreviewText = React.useMemo(() => {
    if (asset && asset !== 'loading' && contract && parties.seller && parties.buyer) {
      return getContractTemplate(assetType, asset, contract, parties as any);
    }
    return 'Aguardando o preenchimento dos dados...';
  }, [asset, assetType, contract, parties]);

  const duplicatesPreview = React.useMemo(() => {
    if (!contract || !asset || asset === 'loading') return null;
    
    const totalValue = (asset.price || (asset.pricePerCredit && asset.quantity ? asset.pricePerCredit * asset.quantity : 0)) || 0;
    const installments = parseInt(contract.fields.seller.installments, 10) || 1;
    const installmentValue = totalValue / installments;
    const today = new Date();
    
    const duplicates = [];
    for (let i = 0; i < installments; i++) {
        const dueDate = new Date(today);
        dueDate.setMonth(today.getMonth() + i + 1);
        duplicates.push({
            orderNumber: `${i + 1}/${installments}`,
            invoiceNumber: `NF-${id.substring(0, 6)}-${i+1}`,
            issueDate: today.toLocaleDateString('pt-BR'),
            dueDate: dueDate.toLocaleDateString('pt-BR'),
            value: installmentValue,
        });
    }
    return duplicates;
  }, [contract, asset, id]);

  const handleDownloadPdf = () => {
    try {
        const doc = new jsPDF('p', 'pt', 'a4');
        const text = contractPreviewText;
        const splitText = doc.splitTextToSize(text, 500); // 500 is width
        doc.text(splitText, 40, 60);
        doc.save(`contrato_${id}.pdf`);
        toast({ title: "Sucesso!", description: "O download do seu contrato em PDF foi iniciado." });
    } catch(e) {
        toast({ title: "Erro", description: "Não foi possível gerar o PDF.", variant: "destructive" });
    }
  }


  if (asset === 'loading' || !assetType) {
    return (
        <div className="flex h-screen w-full items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin" />
        </div>
    )
  }

  if (!asset) {
    notFound();
    return null;
  }

  const finalDeal = generatedDeal || { duplicates: duplicatesPreview };

  return (
    <div className="container mx-auto max-w-full py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8">
            {/* Coluna de Ações (Esquerda) */}
            <div className="w-full lg:w-1/2">
                 <AdjustmentClientPage
                    assetId={id}
                    assetType={assetType}
                    asset={asset}
                    contract={contract}
                    setContract={setContract}
                    loadContract={loadContract}
                    setGeneratedDeal={setGeneratedDeal}
                    handleDownloadPdf={handleDownloadPdf}
                />
            </div>

            {/* Coluna de Pré-visualização (Direita, Fixa) */}
            <div className="w-full lg:w-1/2">
                <div className="lg:sticky lg:top-20 lg:h-[calc(100vh-6rem)]">
                    <div className="h-full w-full flex flex-col space-y-6">
                        <Card className="flex-1 flex flex-col">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle>Pré-visualização do Contrato</CardTitle>
                                    <CardDescription>Este documento é gerado dinamicamente.</CardDescription>
                                </div>
                                <Button variant="outline" size="sm" onClick={handleDownloadPdf}>
                                    <Download className="mr-2 h-4 w-4"/>
                                    Baixar PDF
                                </Button>
                            </CardHeader>
                            <CardContent className="flex-1 h-0 overflow-y-auto bg-secondary/30 p-4 rounded-b-lg border-t">
                                <pre className="whitespace-pre-wrap text-xs font-mono">{contractPreviewText}</pre>
                            </CardContent>
                        </Card>

                        {finalDeal && finalDeal.duplicates && finalDeal.duplicates.length > 0 && (
                        <Card>
                            <CardHeader>
                            <CardTitle>Pré-visualização das Duplicatas</CardTitle>
                            <CardDescription>
                                {generatedDeal ? 'Estas são as duplicatas que foram registradas.' : 'Esta é uma pré-visualização das duplicatas que serão geradas.'}
                            </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4 max-h-80 overflow-y-auto">
                            {finalDeal.duplicates.map((dup, index) => (
                                <Card key={index} className="bg-background overflow-hidden">
                                    <CardHeader className="bg-muted p-4 flex flex-row items-center justify-between">
                                    <CardTitle className="text-lg">DM - DUPLICATA DE VENDA MERCANTIL</CardTitle>
                                    {generatedDeal && <Seal text="Validado em Blockchain" className="border-primary/20 bg-primary/10 text-primary" />}
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
                                        ({numberToWords(dup.value)})
                                        </p>
                                    </div>
                                    </CardContent>
                                </Card>
                                ))}
                            </CardContent>
                        </Card>
                        )}
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
}
