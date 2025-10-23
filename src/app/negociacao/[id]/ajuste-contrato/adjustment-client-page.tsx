
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
import { getAuth, onAuthStateChanged, type User } from 'firebase/auth';
import { app } from '@/lib/firebase';
import { getContractTemplate } from '@/lib/contract-template';
import { Seal } from '@/components/ui/seal';
import { Contrato as ContractModel } from '@/models/Contrato';

type UserRole = 'buyer' | 'seller';

type ContractState = InstanceType<typeof ContractModel>;

export function AdjustmentClientPage({ assetId, assetType, asset }: { assetId: string, assetType: AssetType, asset: Asset | null }) {
  const { toast } = useToast();
  
  const [user, setUser] = React.useState<User | null>(null);
  const [contract, setContract] = React.useState<ContractState | null>(null);
  const [generatedDeal, setGeneratedDeal] = React.useState<CompletedDeal | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [isActionPending, setIsActionPending] = React.useState(false);

  const [sellerEmail, setSellerEmail] = React.useState('');
  const [buyerEmail, setBuyerEmail] = React.useState('');

  const negotiationId = `neg_${assetId}`;

  // Auth listener
  React.useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const loadContract = React.useCallback(async () => {
      if (!user || !asset) {
          if (!user) setLoading(false);
          return;
      }
      try {
        const response = await fetch(`/api/negociacao/get-or-create-contract?negotiationId=${negotiationId}`);
        const data = await response.json();
        
        if (response.ok && data.ok) {
            setContract(data.contract);
            setSellerEmail(data.contract.fields.seller.email || '');
            setBuyerEmail(data.contract.fields.buyer.email || '');
        } else if (response.status === 404) {
            const createResponse = await fetch('/api/negociacao/get-or-create-contract', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    negotiationId,
                    buyerId: user.uid,
                    sellerId: 'ownerId' in asset ? asset.ownerId : '',
                    anuncioId: assetId,
                })
            });
            const createData = await createResponse.json();
             if (createData.ok) {
                setContract(createData.contract);
                setSellerEmail(createData.contract.fields.seller.email || '');
                setBuyerEmail(createData.contract.fields.buyer.email || '');
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
  }, [negotiationId, user, asset, assetId, toast]);


  // Fetch or create contract on mount
  React.useEffect(() => {
    setLoading(true);
    loadContract();
  }, [loadContract]);


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

  const handleSendValidationEmail = async (role: UserRole, email: string) => {
      if(!email) {
          toast({ title: "Erro", description: "O campo de e-mail não pode estar vazio.", variant: "destructive"});
          return;
      }
      setIsActionPending(true);
      try {
          const response = await fetch('/api/negociacao/send-validation-email', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  negotiationId,
                  role: role,
                  userEmail: email,
                  userName: role === 'buyer' ? contract?.fields.buyer.razaoSocial : contract?.fields.seller.razaoSocial,
              }),
          });
          const data = await response.json();
          if (!response.ok) throw new Error(data.error);
          toast({ title: "E-mail Enviado!", description: `O e-mail de validação para o ${role} foi enviado para ${email}.` });
      } catch (error: any) {
          toast({ title: "Erro ao Enviar", description: error.message || 'Falha ao enviar o e-mail de validação.', variant: "destructive" });
      } finally {
          setIsActionPending(false);
      }
  }


  const handleFinalizeContract = async () => {
     try {
      await handleUpdateContractAPI(
          '/api/negociacao/finalizar',
          {}, true
      );
    } catch(error: any) {
       toast({ title: "Erro", description: error.message || 'Falha ao finalizar o contrato.', variant: "destructive" });
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
  
  const handleGenerateDuplicates = async () => {
    if (!contract || !asset) return;

    try {
        setIsActionPending(true);
        const response = await fetch('/api/negociacao/gerar-duplicatas', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ assetId, contract, asset }),
        });

        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Falha ao gerar duplicatas');
        
        setGeneratedDeal(result.deal);
        await handleUpdateContractAPI(
            '/api/negociacao/update-contract',
            { updates: { duplicatesGenerated: true } },
        );
        localStorage.setItem('newDuplicatesAvailable', 'true');
        window.dispatchEvent(new Event('storage'));
        toast({ title: "Sucesso!", description: 'Duplicatas geradas com sucesso!' });

    } catch (error: any) {
         toast({ title: "Erro", description: error.message, variant: "destructive"});
    } finally {
        setIsActionPending(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen"><Loader2 className="h-16 w-16 animate-spin"/></div>
  }
  
  if (!contract || !user) {
      return (
          <div className="container mx-auto max-w-lg py-12 text-center">
              <Card>
                  <CardHeader>
                      <CardTitle>Erro de Carregamento</CardTitle>
                      <CardDescription>Não foi possível carregar os detalhes da negociação. Verifique se está logado e tente novamente.</CardDescription>
                  </CardHeader>
                  <CardContent>
                      <Button asChild>
                          <Link href="/dashboard">Voltar ao Painel</Link>
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
                        <div className="space-y-2"><Label>E-mail para Validação</Label><Input onBlur={(e) => handleFieldChange('seller', 'email', e.target.value)} defaultValue={fields.seller.email} disabled={!isSeller || isFrozen} /></div>
                     </div>
                </div>
                 <div className={cn("p-4 border rounded-lg", isBuyer ? 'bg-background' : 'bg-muted/40')}>
                    <h4 className="font-semibold mb-2">Campos do Comprador</h4>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2"><Label>Razão Social</Label><Input onBlur={(e) => handleFieldChange('buyer', 'razaoSocial', e.target.value)} defaultValue={fields.buyer.razaoSocial} disabled={!isBuyer || isFrozen} /></div>
                        <div className="space-y-2"><Label>CNPJ</Label><Input onBlur={(e) => handleFieldChange('buyer', 'cnpj', e.target.value)} defaultValue={fields.buyer.cnpj} disabled={!isBuyer || isFrozen} /></div>
                        <div className="space-y-2"><Label>Inscrição Estadual</Label><Input onBlur={(e) => handleFieldChange('buyer', 'ie', e.target.value)} defaultValue={fields.buyer.ie} disabled={!isBuyer || isFrozen} /></div>
                        <div className="space-y-2"><Label>Endereço Completo</Label><Input onBlur={(e) => handleFieldChange('buyer', 'endereco', e.target.value)} defaultValue={fields.buyer.endereco} disabled={!isBuyer || isFrozen} /></div>
                        <div className="space-y-2"><Label>E-mail para Validação</Label><Input onBlur={(e) => handleFieldChange('buyer', 'email', e.target.value)} defaultValue={fields.buyer.email} disabled={!isBuyer || isFrozen} /></div>
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
                        <Input value={sellerEmail} onChange={(e) => setSellerEmail(e.target.value)} placeholder="E-mail do vendedor" disabled={isActionPending}/>
                        <Button variant="outline" size="icon" onClick={() => handleSendValidationEmail('seller', sellerEmail)} disabled={isActionPending || emailValidation.seller.validated}><Send className="h-4 w-4"/></Button>
                     </div>
                </div>
                <div className="flex flex-col gap-2 p-4 border rounded-lg bg-secondary/30">
                     <div className="flex justify-between items-center">
                        <p className="font-semibold text-sm capitalize">Comprador</p>
                        {emailValidation.buyer.validated ? <CheckCircle className="h-6 w-6 text-green-600"/> : <Clock className="h-6 w-6 text-muted-foreground"/>}
                     </div>
                     <p className={cn("text-xs font-medium", emailValidation.buyer.validated ? 'text-green-600' : 'text-muted-foreground')}>{emailValidation.buyer.validated ? `Validado em ${new Date(emailValidation.buyer.timestamp!).toLocaleDateString()}` : 'Pendente'}</p>
                      <div className="flex items-center gap-2 pt-2 border-t mt-2">
                        <Input value={buyerEmail} onChange={(e) => setBuyerEmail(e.target.value)} placeholder="E-mail do comprador" disabled={isActionPending}/>
                        <Button variant="outline" size="icon" onClick={() => handleSendValidationEmail('buyer', buyerEmail)} disabled={isActionPending || emailValidation.buyer.validated}><Send className="h-4 w-4"/></Button>
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
                <CardTitle className="flex items-center gap-2"><FileSignature className="h-5 w-5"/>3. Documentos e Duplicatas</CardTitle>
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
                 <Button className="w-full" variant="outline" onClick={handleGenerateDuplicates} disabled={isActionPending || duplicatesGenerated}>
                     {isActionPending && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                     <Fingerprint className="mr-2 h-4 w-4"/>
                     {duplicatesGenerated ? 'Duplicatas Geradas' : 'Gerar Duplicatas Autenticadas'}
                 </Button>
            </CardContent>
            <CardFooter>
                 <Button className="w-full" size="lg" onClick={handleFinalizeContract} disabled={isActionPending || !bothUploaded || !duplicatesGenerated || step === 4}>
                     {isActionPending && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                     {step === 4 ? <><CheckCircle className="mr-2 h-4 w-4"/>Contrato Finalizado</> : <><Lock className="mr-2 h-4 w-4"/>Finalizar Contrato e Transação</>}
                 </Button>
            </CardFooter>
        </Card>
      </div>
    </div>
  );
}
