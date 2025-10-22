
'use client';

import * as React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ArrowLeft, FileSignature, CheckCircle, MailCheck, Loader2, Lock, Users, UploadCloud, FileUp, Fingerprint, Download, Clock, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import type { Asset, AssetType, Duplicata as DuplicataType, CompletedDeal } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { getAuth } from 'firebase/auth';
import { getContractTemplate } from '@/lib/contract-template';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { numberToWords } from '@/lib/number-to-words';
import { Seal } from '@/components/ui/seal';
import { Contrato as ContractModel } from '@/models/Contrato';

type UserRole = 'buyer' | 'seller';

type ContractState = InstanceType<typeof ContractModel>;

export function AdjustmentClientPage({ assetId, assetType, asset }: { assetId: string, assetType: AssetType, asset: Asset | null }) {
  const { toast } = useToast();
  
  const auth = getAuth();
  const currentUser = auth.currentUser;
  const [contract, setContract] = React.useState<ContractState | null>(null);
  const [generatedDeal, setGeneratedDeal] = React.useState<CompletedDeal | null>(null);
  const [loading, setLoading] = React.useState(true);

  const negotiationId = `neg_${assetId}`;

  // Fetch or create contract on mount
  React.useEffect(() => {
    async function loadContract() {
      if (!currentUser || !asset) {
          setLoading(false);
          return;
      };
      setLoading(true);
      try {
        const response = await fetch(`/api/negociacao/get-or-create-contract?negotiationId=${negotiationId}`);
        const data = await response.json();
        if (response.ok && data.ok) {
            setContract(data.contract);
        } else if (response.status === 404) {
            // If not found, try to create it
            const createResponse = await fetch('/api/negociacao/get-or-create-contract', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    negotiationId,
                    buyerId: currentUser.uid,
                    sellerId: 'ownerId' in asset ? asset.ownerId : '',
                    anuncioId: assetId,
                })
            });
            const createData = await createResponse.json();
             if (createData.ok) {
                setContract(createData.contract);
            } else {
                throw new Error(createData.error || "Falha ao criar contrato");
            }
        } else {
            throw new Error(data.error || "Falha ao carregar contrato");
        }
      } catch (error: any) {
        toast({ title: "Erro ao Carregar", description: error.message, variant: 'destructive' });
        setContract(null);
      } finally {
        setLoading(false);
      }
    }
    loadContract();
  }, [negotiationId, currentUser, asset, assetId, toast]);


  const currentUserRole: UserRole | null = (asset && 'ownerId' in asset && currentUser?.uid === asset.ownerId) ? 'seller' : 'buyer';
  
  const handleUpdateContract = async (endpoint: string, body: object, successMessage: string, errorMessage: string) => {
    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ negotiationId, ...body }),
        });
        const data = await response.json();
        if (!data.ok) throw new Error(data.error);
        setContract(data.contract);
        toast({ title: "Sucesso", description: successMessage });
        return data.contract;
    } catch (error: any) {
        toast({ title: "Erro", description: error.message || errorMessage, variant: "destructive" });
        return null;
    }
  };

  const handleAccept = async () => {
    if (!currentUserRole) return;
    const updatedContract = await handleUpdateContract(
      '/api/negociacao/aceite',
      { role: currentUserRole },
      'Seu aceite foi registrado.',
      'Falha ao registrar aceite.'
    );
    if(updatedContract?.step === 2) {
        toast({ title: "Contrato Congelado!", description: "Ambas as partes aceitaram os termos. Prossiga com a verificação por e-mail." });
    }
  };

  const handleSendVerificationEmail = async (role: UserRole) => {
      if (currentUserRole !== role) return;
      const updatedContract = await handleUpdateContract(
          '/api/negociacao/validacao-email',
          { role },
          `E-mail de validação para ${role} confirmado (simulado).`,
          'Falha ao validar e-mail.'
      );
      if(updatedContract?.step === 3) {
          toast({ title: "Validação Completa!", description: "Ambas as partes validaram o e-mail. Prossiga para o upload de documentos." });
      }
  };

  const handleFinalizeContract = async () => {
      await handleUpdateContract(
          '/api/negociacao/finalizar',
          {},
          'Contrato finalizado com sucesso!',
          'Falha ao finalizar o contrato.'
      );
  };
  
  const handleFieldChange = async (role: UserRole, field: string, value: any) => {
    if (contract?.step !== 1 || currentUserRole !== role) return;
    const path = `fields.${role}.${field}`;
    await handleUpdateContract(
      '/api/negociacao/update-contract',
      { updates: { [path]: value } },
      'Campo atualizado.',
      'Falha ao salvar alteração.'
    );
  };

  const finalContractText = React.useMemo(() => {
      if (!asset || !contract) return "Carregando pré-visualização...";
      const parties = {
        seller: { 
            name: contract.fields.seller.razaoSocial, 
            doc: contract.fields.seller.cnpj, 
            address: contract.fields.seller.endereco,
            ie: contract.fields.seller.ie,
            repName: 'N/A', repDoc: 'N/A', repRole: 'N/A'
        },
        buyer: { 
            name: contract.fields.buyer.razaoSocial, 
            doc: contract.fields.buyer.cnpj, 
            address: contract.fields.buyer.endereco,
            ie: contract.fields.buyer.ie
        }
      }
      return getContractTemplate(assetType, asset, contract, parties);
  }, [asset, assetType, contract]);
  
  const handleFileUpload = (role: UserRole) => {
    if (currentUserRole !== role) return;
     toast({ title: "Funcionalidade em desenvolvimento."});
     handleUpdateContract(
         '/api/negociacao/update-contract',
         { updates: { [`documents.${role}.fileUrl`]: `contrato_${role}.pdf` } },
         'Documento anexado (simulado).',
         'Falha ao anexar documento.'
     );
  };
  
  const handleGenerateDuplicates = async () => {
    if (!contract || !asset) return;

    try {
        const response = await fetch('/api/negociacao/gerar-duplicatas', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ assetId, contract, asset }),
        });

        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Falha ao gerar duplicatas');
        
        setGeneratedDeal(result.deal);
        await handleUpdateContract(
            '/api/negociacao/update-contract',
            { updates: { duplicatesGenerated: true } },
            'Duplicatas geradas com sucesso!',
            'Falha ao atualizar status de duplicatas.'
        );
        localStorage.setItem('newDuplicatesAvailable', 'true');
        window.dispatchEvent(new Event('storage'));

    } catch (error: any) {
         toast({ title: "Erro", description: error.message, variant: "destructive"});
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen"><Loader2 className="h-16 w-16 animate-spin"/></div>
  }
  
  if (!contract) {
      return (
          <div className="container mx-auto max-w-lg py-12 text-center">
              <Card>
                  <CardHeader>
                      <CardTitle>Erro</CardTitle>
                      <CardDescription>Não foi possível carregar ou criar os detalhes da negociação. Por favor, tente voltar e iniciar a negociação novamente.</CardDescription>
                  </CardHeader>
                  <CardContent>
                      <Button asChild>
                          <Link href="/credito-de-carbono">Voltar ao Marketplace</Link>
                      </Button>
                  </CardContent>
              </Card>
          </div>
      );
  }
  
  const { step, fields, acceptances, emailValidation, documents, duplicatesGenerated } = contract;
  const isSeller = currentUserRole === 'seller';
  const isBuyer = currentUserRole === 'buyer';
  const isFrozen = step > 1;
  const bothAgreed = acceptances.buyer.accepted && acceptances.seller.accepted;
  const bothValidated = emailValidation.buyer.validated && emailValidation.seller.validated;
  const bothUploaded = documents.buyer.fileUrl && documents.seller.fileUrl;
  
  return (
    <div className="container mx-auto max-w-4xl py-8 px-4 sm:px-6 lg:px-8">
       <div className="mb-6">
        <Button variant="outline" asChild>
            <Link href={`/chat-negociacao?id=${negotiationId}`}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar para a Negociação
            </Link>
        </Button>
      </div>
      <div className="space-y-8">
        {/* Renderização condicional baseada no 'step' */}
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5"/>1. Preenchimento e Acordo</CardTitle>
                {isFrozen && <Seal text="Congelado"/>}
            </CardHeader>
            <CardContent className="space-y-6">
                <div className={cn("p-4 border rounded-lg", isSeller ? 'bg-background' : 'bg-muted/40')}>
                     <h4 className="font-semibold mb-2">Campos do Vendedor</h4>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Campos do Vendedor */}
                        <div className="space-y-2"><Label>Razão Social</Label><Input value={fields.seller.razaoSocial} onChange={(e) => handleFieldChange('seller', 'razaoSocial', e.target.value)} disabled={!isSeller || isFrozen} /></div>
                        <div className="space-y-2"><Label>CNPJ</Label><Input value={fields.seller.cnpj} onChange={(e) => handleFieldChange('seller', 'cnpj', e.target.value)} disabled={!isSeller || isFrozen} /></div>
                        <div className="space-y-2"><Label>Inscrição Estadual</Label><Input value={fields.seller.ie} onChange={(e) => handleFieldChange('seller', 'ie', e.target.value)} disabled={!isSeller || isFrozen} /></div>
                        <div className="space-y-2"><Label>Endereço Completo</Label><Input value={fields.seller.endereco} onChange={(e) => handleFieldChange('seller', 'endereco', e.target.value)} disabled={!isSeller || isFrozen} /></div>
                     </div>
                </div>
                 <div className={cn("p-4 border rounded-lg", isBuyer ? 'bg-background' : 'bg-muted/40')}>
                    <h4 className="font-semibold mb-2">Campos do Comprador</h4>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Campos do Comprador */}
                        <div className="space-y-2"><Label>Razão Social</Label><Input value={fields.buyer.razaoSocial} onChange={(e) => handleFieldChange('buyer', 'razaoSocial', e.target.value)} disabled={!isBuyer || isFrozen} /></div>
                        <div className="space-y-2"><Label>CNPJ</Label><Input value={fields.buyer.cnpj} onChange={(e) => handleFieldChange('buyer', 'cnpj', e.target.value)} disabled={!isBuyer || isFrozen} /></div>
                        <div className="space-y-2"><Label>Inscrição Estadual</Label><Input value={fields.buyer.ie} onChange={(e) => handleFieldChange('buyer', 'ie', e.target.value)} disabled={!isBuyer || isFrozen} /></div>
                        <div className="space-y-2"><Label>Endereço Completo</Label><Input value={fields.buyer.endereco} onChange={(e) => handleFieldChange('buyer', 'endereco', e.target.value)} disabled={!isBuyer || isFrozen} /></div>
                    </div>
                </div>
            </CardContent>
            {!isFrozen && (
                <CardFooter>
                    <Button className="w-full" onClick={handleAccept} disabled={(isBuyer && acceptances.buyer.accepted) || (isSeller && acceptances.seller.accepted)}>
                        <CheckCircle className="mr-2 h-4 w-4"/>
                        {`Aceitar Termos como ${currentUserRole === 'buyer' ? 'Comprador' : 'Vendedor'}`}
                    </Button>
                </CardFooter>
            )}
        </Card>

        <Card className={cn(!bothAgreed && "opacity-50 pointer-events-none")}>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2"><MailCheck className="h-5 w-5"/>2. Verificação por E-mail</CardTitle>
                {bothValidated && <Seal text="Validado"/>}
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
                 <div className="flex flex-col items-center gap-2 p-4 border rounded-lg bg-secondary/30">
                     <p className="font-semibold text-sm capitalize">Vendedor</p>
                     {emailValidation.seller.validated ? <CheckCircle className="h-8 w-8 text-green-600"/> : <Clock className="h-8 w-8 text-muted-foreground"/>}
                     <p className={cn("text-xs font-medium", emailValidation.seller.validated ? 'text-green-600' : 'text-muted-foreground')}>{emailValidation.seller.validated ? 'Validado' : 'Pendente'}</p>
                     {isSeller && !emailValidation.seller.validated && <Button size="sm" variant="outline" className="mt-2" onClick={() => handleSendVerificationEmail('seller')}>Validar E-mail</Button>}
                 </div>
                 <div className="flex flex-col items-center gap-2 p-4 border rounded-lg bg-secondary/30">
                     <p className="font-semibold text-sm capitalize">Comprador</p>
                     {emailValidation.buyer.validated ? <CheckCircle className="h-8 w-8 text-green-600"/> : <Clock className="h-8 w-8 text-muted-foreground"/>}
                     <p className={cn("text-xs font-medium", emailValidation.buyer.validated ? 'text-green-600' : 'text-muted-foreground')}>{emailValidation.buyer.validated ? 'Validado' : 'Pendente'}</p>
                     {isBuyer && !emailValidation.buyer.validated && <Button size="sm" variant="outline" className="mt-2" onClick={() => handleSendVerificationEmail('buyer')}>Validar E-mail</Button>}
                 </div>
            </CardContent>
        </Card>

        <Card className={cn(!bothValidated && "opacity-50 pointer-events-none")}>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2"><FileUp className="h-5 w-5"/>3. Documentos e Duplicatas</CardTitle>
                 {step > 3 && <Seal text="Finalizado"/>}
            </CardHeader>
            <CardContent className="space-y-6">
                 <div className="grid grid-cols-2 gap-4">
                     <div className={cn("space-y-2 p-4 rounded-lg border", isSeller ? 'bg-background' : 'bg-muted/40')}>
                         <h4 className="font-semibold text-sm">Contrato do Vendedor</h4>
                         <div className="h-24 border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-center p-2 cursor-pointer hover:bg-secondary" onClick={() => handleFileUpload('seller')}>
                            {documents.seller.fileUrl ? <CheckCircle className="h-6 w-6 text-green-500"/> : <UploadCloud className="h-6 w-6 text-muted-foreground"/>}
                            <p className="text-xs text-muted-foreground mt-1">{documents.seller.fileUrl ? 'Contrato Anexado' : 'Anexar Contrato Assinado'}</p>
                         </div>
                     </div>
                     <div className={cn("space-y-2 p-4 rounded-lg border", isBuyer ? 'bg-background' : 'bg-muted/40')}>
                        <h4 className="font-semibold text-sm">Contrato do Comprador</h4>
                        <div className="h-24 border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-center p-2 cursor-pointer hover:bg-secondary" onClick={() => handleFileUpload('buyer')}>
                             {documents.buyer.fileUrl ? <CheckCircle className="h-6 w-6 text-green-500"/> : <UploadCloud className="h-6 w-6 text-muted-foreground"/>}
                            <p className="text-xs text-muted-foreground mt-1">{documents.buyer.fileUrl ? 'Contrato Anexado' : 'Anexar Contrato Assinado'}</p>
                        </div>
                     </div>
                 </div>
                 <Button className="w-full" variant="outline" onClick={handleGenerateDuplicates} disabled={duplicatesGenerated}>
                     <Fingerprint className="mr-2 h-4 w-4"/>
                     {duplicatesGenerated ? 'Duplicatas Geradas' : 'Gerar Duplicatas Autenticadas'}
                 </Button>
            </CardContent>
            <CardFooter>
                 <Button className="w-full" size="lg" onClick={handleFinalizeContract} disabled={!bothUploaded || !duplicatesGenerated || step === 4}>
                     {step === 4 ? <><CheckCircle className="mr-2 h-4 w-4"/>Contrato Finalizado</> : <><Lock className="mr-2 h-4 w-4"/>Finalizar Contrato e Transação</>}
                 </Button>
            </CardFooter>
        </Card>
      </div>
    </div>
  );
}
