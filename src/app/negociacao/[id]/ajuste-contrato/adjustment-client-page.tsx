
'use client';

import * as React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileSignature, CheckCircle, MailCheck, Loader2, Lock, Users, UploadCloud, Fingerprint, Clock, Send, Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import type { Asset, AssetType, CompletedDeal } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useUser } from '@/firebase';
import { Seal } from '@/components/ui/seal';
import { Contrato as ContractModel } from '@/models/Contrato';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
  handleDownloadPdf: () => void;
}

export default function AdjustmentClientPage({ 
    assetId, 
    assetType,
    asset, 
    contract, 
    setContract, 
    loadContract,
    setGeneratedDeal,
    handleDownloadPdf,
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
      
      // 5. Send message to update dashboard charts
      const channel = new BroadcastChannel("dashboard-update");
      channel.postMessage("contract-finalized");
      channel.close();
      
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

  const handleFileUpload = async (role: UserRole, file: File) => {
    if (currentUserRole !== role || !contract || contract.step !== 3) return;

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast({ title: "Arquivo muito grande", description: "O arquivo não pode exceder 10MB.", variant: "destructive" });
        return;
    }
    
    setIsActionPending(true);
    
    // In a real app, you'd upload to a storage service. Here, we'll simulate it by updating the DB.
    // The `fileUrl` will just be the filename for demonstration.
    const fileUrl = `contrato_${role}_${assetId}_${file.name}`;
    
    try {
        await handleUpdateContractAPI(
            '/api/negociacao/update-contract',
            { updates: { [`documents.${role}.fileUrl`]: fileUrl } },
        );
        toast({ title: 'Documento anexado!', description: 'Seu contrato assinado foi enviado.' });
    } catch (error: any) {
        toast({ title: "Erro", description: error.message || 'Falha ao anexar documento.', variant: "destructive" });
    } finally {
        setIsActionPending(false);
    }
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
  
  const UploadArea = ({ forRole }: { forRole: UserRole }) => {
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const documentExists = documents[forRole].fileUrl;
    const canUpload = currentUserRole === forRole && step === 3;
    const isDisabled = isActionPending || !canUpload || documentExists || (isBuyer && !documents.seller.fileUrl);

    const handleTriggerUpload = () => {
        if (isDisabled) return;
        fileInputRef.current?.click();
    };

    const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleFileUpload(forRole, e.target.files[0]);
        }
    };
    
    let message = 'Pendente';
    if (documentExists) {
        message = 'Contrato Anexado';
    } else if (isActionPending && currentUserRole === forRole) {
        message = 'Enviando...';
    } else if (canUpload) {
        if (isBuyer && !documents.seller.fileUrl) {
            message = 'Aguardando documento do vendedor';
        } else {
            message = 'Clique para anexar o contrato assinado';
        }
    }

    return (
        <div className={cn("space-y-2 p-4 rounded-lg border", currentUserRole === forRole ? 'bg-background' : 'bg-muted/40')}>
            <h4 className="font-semibold text-sm capitalize">{forRole === 'seller' ? 'Passo 1: Vendedor' : 'Passo 2: Comprador'}</h4>
            <div 
                className={cn(
                    "h-24 border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-center p-2",
                    !isDisabled && "cursor-pointer hover:bg-secondary"
                )}
                onClick={handleTriggerUpload}
            >
                {isActionPending && currentUserRole === forRole ? (
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground"/>
                ) : documentExists ? (
                    <CheckCircle className="h-6 w-6 text-green-500"/>
                ) : (
                    <UploadCloud className="h-6 w-6 text-muted-foreground"/>
                )}
                <p className="text-xs text-muted-foreground mt-1">{message}</p>
            </div>
            <input 
                ref={fileInputRef}
                type="file" 
                className="hidden" 
                onChange={handleFileSelected}
                accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/jpeg,image/png"
                disabled={isDisabled}
            />
            {isBuyer && documents.seller.fileUrl && !documentExists && (
                 <Button variant="outline" size="sm" className="w-full mt-2" onClick={() => toast({ title: 'Simulando download...', description: 'Em um app real, o arquivo seria baixado.'})}>
                    <Download className="mr-2 h-4 w-4"/> Baixar Contrato para Assinar
                 </Button>
            )}
        </div>
    );
  };
  

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
                     <h4 className="font-semibold mb-4">Campos do Vendedor</h4>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2"><Label>Razão Social</Label><Input onBlur={(e) => handleFieldChange('seller', 'razaoSocial', e.target.value)} defaultValue={fields.seller.razaoSocial} disabled={!isSeller || isFrozen} /></div>
                        <div className="space-y-2"><Label>CNPJ</Label><Input onBlur={(e) => handleFieldChange('seller', 'cnpj', e.target.value)} defaultValue={fields.seller.cnpj} disabled={!isSeller || isFrozen} /></div>
                        <div className="space-y-2"><Label>Inscrição Estadual</Label><Input onBlur={(e) => handleFieldChange('seller', 'ie', e.target.value)} defaultValue={fields.seller.ie} disabled={!isSeller || isFrozen} /></div>
                        <div className="space-y-2"><Label>Endereço Completo</Label><Input onBlur={(e) => handleFieldChange('seller', 'endereco', e.target.value)} defaultValue={fields.seller.endereco} disabled={!isSeller || isFrozen} /></div>
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t">
                        <div className="space-y-2">
                           <Label>Forma de Pagamento</Label>
                           <Select onValueChange={(value) => handleFieldChange('seller', 'paymentMethod', value)} defaultValue={fields.seller.paymentMethod} disabled={!isSeller || isFrozen}>
                                <SelectTrigger><SelectValue/></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="vista">À Vista</SelectItem>
                                    <SelectItem value="parcelado">Parcelado</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        {fields.seller.paymentMethod === 'parcelado' && (
                             <div className="space-y-2">
                                <Label>Nº de Parcelas</Label>
                                <Input type="number" onBlur={(e) => handleFieldChange('seller', 'installments', e.target.value)} defaultValue={fields.seller.installments} disabled={!isSeller || isFrozen} />
                            </div>
                        )}
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
                        <Input value={sellerEmail} onChange={(e) => setSellerEmail(e.target.value)} placeholder="E-mail do vendedor" disabled={isActionPending || emailValidation.seller.validated || !isSeller}/>
                        <Button variant="outline" size="icon" onClick={() => handleSendValidationEmail('seller')} disabled={isActionPending || emailValidation.seller.validated || !isSeller}><Send className="h-4 w-4"/></Button>
                     </div>
                </div>
                <div className="flex flex-col gap-2 p-4 border rounded-lg bg-secondary/30">
                     <div className="flex justify-between items-center">
                        <p className="font-semibold text-sm capitalize">Comprador</p>
                        {emailValidation.buyer.validated ? <CheckCircle className="h-6 w-6 text-green-600"/> : <Clock className="h-6 w-6 text-muted-foreground"/>}
                     </div>
                     <p className={cn("text-xs font-medium", emailValidation.buyer.validated ? 'text-green-600' : 'text-muted-foreground')}>{emailValidation.buyer.validated ? `Validado em ${new Date(emailValidation.buyer.timestamp!).toLocaleDateString()}` : 'Pendente'}</p>
                      <div className="flex items-center gap-2 pt-2 border-t mt-2">
                        <Input value={buyerEmail} onChange={(e) => setBuyerEmail(e.target.value)} placeholder="E-mail do comprador" disabled={isActionPending || emailValidation.buyer.validated || !isBuyer}/>
                        <Button variant="outline" size="icon" onClick={() => handleSendValidationEmail('buyer')} disabled={isActionPending || emailValidation.buyer.validated || !isBuyer}><Send className="h-4 w-4"/></Button>
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
            <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground text-center">O vendedor deve baixar o contrato, assinar e fazer o upload. Em seguida, o comprador poderá baixar, assinar e enviar sua versão.</p>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                    <UploadArea forRole="seller" />
                    <UploadArea forRole="buyer" />
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
