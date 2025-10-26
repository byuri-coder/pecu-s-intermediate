
'use client';

import * as React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileSignature, CheckCircle, MailCheck, Loader2, Lock, Users, UploadCloud, Fingerprint, Clock, Send } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import type { Asset, AssetType, CompletedDeal } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useUser } from '@/firebase';
import { Seal } from '@/components/ui/seal';
import { Contrato as ContractModel } from '@/models/Contrato';

type UserRole = 'buyer' | 'seller';
type ContractState = InstanceType<typeof ContractModel>;

interface AdjustmentClientPageProps {
  assetId: string;
  assetType: AssetType;
  asset: Asset | null;
  contract: ContractState | null;
  setContract: React.Dispatch<React.SetStateAction<ContractState | null>>;
  loadContract: () => void;
  setGeneratedDeal: React.Dispatch<React.SetStateAction<CompletedDeal | null>>;
}

export default function AdjustmentClientPage({ 
    assetId, 
    assetType,
    asset, 
    contract, 
    setContract, 
    loadContract,
    setGeneratedDeal
}: AdjustmentClientPageProps) {
  const { toast } = useToast();
  const { user } = useUser();
  const [isActionPending, setIsActionPending] = React.useState(false);

  const [sellerEmail, setSellerEmail] = React.useState('');
  const [buyerEmail, setBuyerEmail] = React.useState('');

  const negotiationId = `neg_${assetId}`;

  React.useEffect(() => {
    if (contract) {
        setSellerEmail(contract.fields?.seller?.email || '');
        setBuyerEmail(contract.fields?.buyer?.email || '');
    }
  }, [contract]);


  const currentUserRole: UserRole | null = (asset && 'ownerId' in asset && user?.uid === asset.ownerId) ? 'seller' : 'buyer';
  
  const handleUpdateContractAPI = async (endpoint: string, body: object, showToast = false) => {
    setIsActionPending(true);
    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ negotiationId, ...body }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        setContract(data.contract); // Update local state with the new contract from the backend
        if (showToast) {
             toast({ title: "Sucesso!", description: 'Operação realizada com sucesso.' });
        }
        return data;
    } finally {
        setIsActionPending(false);
    }
  };
  
  const handleAccept = async () => {
    if (!currentUserRole || !user || !contract) return;
    
    try {
        await handleUpdateContractAPI('/api/negociacao/aceite', { role: currentUserRole }, true);
    } catch (error: any) {
        toast({ title: "Erro", description: error.message || 'Falha ao registrar aceite.', variant: "destructive" });
    }
  };

  const handleSendValidationEmail = async (role: UserRole) => {
      if (!user || !contract) return;
      const targetEmail = role === 'seller' ? sellerEmail : buyerEmail;
      const targetName = role === 'seller' ? contract.fields.seller.razaoSocial : contract.fields.buyer.razaoSocial;
      const targetUserId = role === 'seller' ? contract.sellerId : contract.buyerId;

      if(!targetEmail) {
          toast({ title: "Erro", description: "O campo de e-mail não pode estar vazio.", variant: "destructive"});
          return;
      }
      setIsActionPending(true);
      try {
          const response = await fetch('/api/negociacao/send-validation-email', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  toEmail: targetEmail,
                  toName: targetName,
                  contractId: contract._id,
                  userId: targetUserId,
                  role: role,
              }),
          });
          const data = await response.json();
          if (!response.ok) throw new Error(data.error || data.details);
          toast({ title: "E-mail Enviado!", description: `O e-mail de validação para o ${role} foi enviado para ${targetEmail}.` });
      } catch (error: any) {
          toast({ title: "Erro ao Enviar", description: error.message || 'Falha ao enviar o e-mail de validação.', variant: "destructive" });
      } finally {
          setIsActionPending(false);
      }
  }


  const handleFinalizeAndGenerate = async () => {
     if (!contract || !asset) return;
    setIsActionPending(true);
    try {
      // 1. Finalize contract (move to step 4)
      await handleUpdateContractAPI('/api/negociacao/finalizar', {});
      
      // 2. Generate duplicates and invoice
      const response = await fetch('/api/negociacao/gerar-duplicatas', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ assetId, contract, asset }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Falha ao gerar duplicatas');
      
      // 3. Update UI
      setGeneratedDeal(result.deal);
      
      // 4. Set flags in local storage to trigger notifications
      localStorage.setItem('newDuplicatesAvailable', 'true');
      localStorage.setItem('newInvoicesAvailable', 'true');
      window.dispatchEvent(new Event('storage'));
      
      toast({ title: "Contrato Finalizado!", description: 'As duplicatas e faturas foram geradas com sucesso!' });

    } catch(error: any) {
       toast({ title: "Erro", description: error.message || 'Falha ao finalizar o contrato.', variant: "destructive" });
    } finally {
        setIsActionPending(false);
    }
  };
  
  const handleFieldChange = async (role: UserRole, field: string, value: any) => {
    if (contract?.step !== 1 || currentUserRole !== role) return;
    const path = `fields.${role}.${field}`;
    
    // Optimistic UI update
    setContract(prev => {
        if (!prev) return null;
        const newContract = JSON.parse(JSON.stringify(prev));
        newContract.fields[role][field] = value;
        return newContract;
    });

    try {
      await handleUpdateContractAPI(
        '/api/negociacao/update-contract',
        { updates: { [path]: value } },
      );
    } catch (error: any) {
        toast({ title: "Erro ao Salvar", description: 'Não foi possível salvar a alteração. Verifique sua conexão.', variant: 'destructive' });
        // Revert UI on failure
        loadContract();
    }
  };

  const handleFileUpload = (role: UserRole) => {
    if (currentUserRole !== role || !contract || contract.step !== 3) return;
     
     setIsActionPending(true);
     // Simulate file upload
     setTimeout(() => {
        handleUpdateContractAPI(
            '/api/negociacao/update-contract',
            { updates: { [`documents.${role}.fileUrl`]: `contrato_${role}_${assetId}.pdf` } },
        ).then(() => {
            toast({ title: 'Documento anexado (simulado).' });
        }).catch((error: any) => {
            toast({ title: "Erro", description: error.message || 'Falha ao anexar documento.', variant: 'destructive' });
        });
     }, 1000);
  };
  

  if (!contract || !user) {
      return (
          <div className="container mx-auto max-w-lg py-12 text-center">
              <Card>
                  <CardHeader>
                      <CardTitle>A carregar...</CardTitle>
                      <CardDescription>A carregar os detalhes da negociação...</CardDescription>
                  </CardHeader>
                  <CardContent>
                      <Loader2 className="mx-auto h-10 w-10 animate-spin"/>
                  </CardContent>
              </Card>
          </div>
      );
  }
  
  const { step, fields, acceptances, emailValidation, documents } = contract;
  const isSeller = currentUserRole === 'seller';
  const isBuyer = currentUserRole === 'buyer';
  const isFrozen = step > 1;
  const bothAgreed = acceptances.buyer.accepted && acceptances.seller.accepted;
  const bothValidated = emailValidation.buyer.validated && emailValidation.seller.validated;
  const bothUploaded = documents.buyer.fileUrl && documents.seller.fileUrl;
  
  return (
    <div className="space-y-8">
       <div className="mb-6">
        <Button variant="outline" asChild>
            <Link href={`/chat-negociacao?id=${negotiationId}`}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar para a Negociação
            </Link>
        </Button>
      </div>
        {/* Etapa 1: Preenchimento e Acordo */}
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5"/>1. Preenchimento e Acordo</CardTitle>
                {isFrozen && <Seal text="Congelado"/>}
            </CardHeader>
            <CardContent className="space-y-6">
                <div className={cn("p-4 border rounded-lg", isSeller ? 'bg-background' : 'bg-muted/40')}>
                     <h4 className="font-semibold mb-2">Campos do Vendedor</h4>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2"><Label>Razão Social</Label><Input onBlur={(e) => handleFieldChange('seller', 'razaoSocial', e.target.value)} defaultValue={fields.seller.razaoSocial} disabled={!isSeller || isFrozen} /></div>
                        <div className="space-y-2"><Label>CNPJ</Label><Input onBlur={(e) => handleFieldChange('seller', 'cnpj', e.target.value)} defaultValue={fields.seller.cnpj} disabled={!isSeller || isFrozen} /></div>
                        <div className="space-y-2"><Label>Inscrição Estadual</Label><Input onBlur={(e) => handleFieldChange('seller', 'ie', e.target.value)} defaultValue={fields.seller.ie} disabled={!isSeller || isFrozen} /></div>
                        <div className="space-y-2"><Label>Endereço Completo</Label><Input onBlur={(e) => handleFieldChange('seller', 'endereco', e.target.value)} defaultValue={fields.seller.endereco} disabled={!isSeller || isFrozen} /></div>
                     </div>
                </div>
                 <div className={cn("p-4 border rounded-lg", isBuyer ? 'bg-background' : 'bg-muted/40')}>
                    <h4 className="font-semibold mb-2">Campos do Comprador</h4>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2"><Label>Razão Social</Label><Input onBlur={(e) => handleFieldChange('buyer', 'razaoSocial', e.target.value)} defaultValue={fields.buyer.razaoSocial} disabled={!isBuyer || isFrozen} /></div>
                        <div className="space-y-2"><Label>CNPJ</Label><Input onBlur={(e) => handleFieldChange('buyer', 'cnpj', e.target.value)} defaultValue={fields.buyer.cnpj} disabled={!isBuyer || isFrozen} /></div>
                        <div className="space-y-2"><Label>Inscrição Estadual</Label><Input onBlur={(e) => handleFieldChange('buyer', 'ie', e.target.value)} defaultValue={fields.buyer.ie} disabled={!isBuyer || isFrozen} /></div>
                        <div className="space-y-2"><Label>Endereço Completo</Label><Input onBlur={(e) => handleFieldChange('buyer', 'endereco', e.target.value)} defaultValue={fields.buyer.endereco} disabled={!isBuyer || isFrozen} /></div>
                    </div>
                </div>
            </CardContent>
            {!isFrozen && (
                <CardFooter>
                    <Button className="w-full" onClick={handleAccept} disabled={isActionPending || (isBuyer && acceptances.buyer.accepted) || (isSeller && acceptances.seller.accepted)}>
                        {isActionPending && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                        <CheckCircle className="mr-2 h-4 w-4"/>
                        {`Aceitar Termos como ${currentUserRole === 'buyer' ? 'Comprador' : 'Vendedor'}`}
                    </Button>
                </CardFooter>
            )}
        </Card>

        {/* Etapa 2: Validação por E-mail */}
        <Card className={cn(!bothAgreed && "opacity-50 pointer-events-none")}>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2"><MailCheck className="h-5 w-5"/>2. Verificação por E-mail</CardTitle>
                {bothValidated && <Seal text="Validado"/>}
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2 p-4 border rounded-lg bg-secondary/30">
                     <div className="flex justify-between items-center">
                        <p className="font-semibold text-sm capitalize">Vendedor</p>
                        {emailValidation.seller.validated ? <CheckCircle className="h-6 w-6 text-green-600"/> : <Clock className="h-6 w-6 text-muted-foreground"/>}
                     </div>
                     <p className={cn("text-xs font-medium", emailValidation.seller.validated ? 'text-green-600' : 'text-muted-foreground')}>{emailValidation.seller.validated ? `Validado em ${new Date(emailValidation.seller.timestamp!).toLocaleDateString()}` : 'Pendente'}</p>
                     <div className="flex items-center gap-2 pt-2 border-t mt-2">
                        <Input value={sellerEmail} onChange={(e) => setSellerEmail(e.target.value)} placeholder="E-mail do vendedor" disabled={isActionPending || emailValidation.seller.validated}/>
                        <Button variant="outline" size="icon" onClick={() => handleSendValidationEmail('seller')} disabled={isActionPending || emailValidation.seller.validated}><Send className="h-4 w-4"/></Button>
                     </div>
                </div>
                <div className="flex flex-col gap-2 p-4 border rounded-lg bg-secondary/30">
                     <div className="flex justify-between items-center">
                        <p className="font-semibold text-sm capitalize">Comprador</p>
                        {emailValidation.buyer.validated ? <CheckCircle className="h-6 w-6 text-green-600"/> : <Clock className="h-6 w-6 text-muted-foreground"/>}
                     </div>
                     <p className={cn("text-xs font-medium", emailValidation.buyer.validated ? 'text-green-600' : 'text-muted-foreground')}>{emailValidation.buyer.validated ? `Validado em ${new Date(emailValidation.buyer.timestamp!).toLocaleDateString()}` : 'Pendente'}</p>
                      <div className="flex items-center gap-2 pt-2 border-t mt-2">
                        <Input value={buyerEmail} onChange={(e) => setBuyerEmail(e.target.value)} placeholder="E-mail do comprador" disabled={isActionPending || emailValidation.buyer.validated}/>
                        <Button variant="outline" size="icon" onClick={() => handleSendValidationEmail('buyer')} disabled={isActionPending || emailValidation.buyer.validated}><Send className="h-4 w-4"/></Button>
                     </div>
                </div>
            </CardContent>
             <CardFooter className="text-center text-xs text-muted-foreground">
                <p>Após ambos aceitarem os termos, um e-mail de validação será enviado. Clique no link do e-mail para confirmar sua identidade e prosseguir.</p>
            </CardFooter>
        </Card>

        {/* Etapa 3: Documentos e Duplicatas */}
        <Card className={cn(!bothValidated && "opacity-50 pointer-events-none")}>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2"><FileSignature className="h-5 w-5"/>3. Documentos e Finalização</CardTitle>
                 {step > 3 && <Seal text="Finalizado"/>}
            </CardHeader>
            <CardContent className="space-y-6">
                 <div className="grid grid-cols-2 gap-4">
                     <div className={cn("space-y-2 p-4 rounded-lg border", isSeller ? 'bg-background' : 'bg-muted/40')}>
                         <h4 className="font-semibold text-sm">Contrato do Vendedor</h4>
                         <div className={cn("h-24 border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-center p-2", isSeller && step === 3 && "cursor-pointer hover:bg-secondary")} onClick={() => handleFileUpload('seller')}>
                            {documents.seller.fileUrl ? <CheckCircle className="h-6 w-6 text-green-500"/> : <UploadCloud className="h-6 w-6 text-muted-foreground"/>}
                            <p className="text-xs text-muted-foreground mt-1">{documents.seller.fileUrl ? 'Contrato Anexado' : 'Anexar Contrato Assinado'}</p>
                         </div>
                     </div>
                     <div className={cn("space-y-2 p-4 rounded-lg border", isBuyer ? 'bg-background' : 'bg-muted/40')}>
                        <h4 className="font-semibold text-sm">Contrato do Comprador</h4>
                        <div className={cn("h-24 border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-center p-2", isBuyer && step === 3 && "cursor-pointer hover:bg-secondary")} onClick={() => handleFileUpload('buyer')}>
                             {documents.buyer.fileUrl ? <CheckCircle className="h-6 w-6 text-green-500"/> : <UploadCloud className="h-6 w-6 text-muted-foreground"/>}
                            <p className="text-xs text-muted-foreground mt-1">{documents.buyer.fileUrl ? 'Contrato Anexado' : 'Anexar Contrato Assinado'}</p>
                        </div>
                     </div>
                 </div>
            </CardContent>
            <CardFooter>
                 <Button className="w-full" size="lg" onClick={handleFinalizeAndGenerate} disabled={isActionPending || !bothUploaded || step === 4}>
                     {isActionPending && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                     {step === 4 ? <><CheckCircle className="mr-2 h-4 w-4"/>Contrato Finalizado</> : <><Lock className="mr-2 h-4 w-4"/>Finalizar e Gerar Duplicatas</>}
                 </Button>
            </CardFooter>
        </Card>
      </div>
  );
}
