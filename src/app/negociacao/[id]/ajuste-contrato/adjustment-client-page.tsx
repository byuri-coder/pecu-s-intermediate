

'use client';

import * as React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ArrowLeft, FileSignature, CheckCircle, MailCheck, Loader2, Lock, Users, UploadCloud, FileUp, Fingerprint, Download, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import type { Asset, AssetType } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getAuth } from 'firebase/auth';
import { getContractTemplate } from '@/lib/contract-template';

type UserRole = 'buyer' | 'seller';
type AuthStatus = 'pending' | 'validated' | 'expired';

type NegotiationState = {
  status: 'draft' | 'awaiting_verification' | 'awaiting_uploads' | 'completed';
  [key: string]: any; 
};

type ContractState = {
  isFrozen: boolean;
  fields: {
    seller: {
      paymentMethod: 'vista' | 'parcelado';
      installments: string;
      interestPercent: string;
      [key: string]: any;
    };
    buyer: {
      razaoSocial: string;
      cnpj: string;
      ie: string;
      endereco: string;
      [key: string]: any;
    };
  };
  sellerAgrees: boolean;
  buyerAgrees: boolean;
  verifications: {
      seller: AuthStatus;
      buyer: AuthStatus;
  };
  uploads: {
      seller: any[];
      buyer: any[];
  }
};

const AuthStatusIndicator = ({ 
    role, 
    status,
    currentUserRole,
    onSendVerification
}: { 
    role: UserRole; 
    status: AuthStatus;
    currentUserRole: UserRole | null;
    onSendVerification: (role: UserRole) => void;
}) => {
    const statusMap = {
        pending: { icon: Clock, text: 'Pendente', className: 'text-muted-foreground' },
        validated: { icon: CheckCircle, text: 'Validado', className: 'text-green-600' },
        expired: { icon: CheckCircle, text: 'Expirado', className: 'text-destructive' },
    };
    const { icon: Icon, text, className } = statusMap[status];
    const canSend = currentUserRole === role && status === 'pending';

    return (
        <div className="flex flex-col items-center gap-2 p-4 border rounded-lg bg-secondary/30">
            <p className="font-semibold text-sm capitalize">{role}</p>
            <Icon className={cn("h-8 w-8", className)} />
            <p className={cn("text-xs font-medium", className)}>{text}</p>
            {canSend && (
                 <Button size="sm" variant="outline" className="mt-2" onClick={() => onSendVerification(role)}>
                    Enviar Email de Validação
                </Button>
            )}
        </div>
    );
};


export function AdjustmentClientPage({ assetId, assetType, asset }: { assetId: string, assetType: AssetType, asset: Asset | null }) {
  const { toast } = useToast();
  
  const auth = getAuth();
  const currentUser = auth.currentUser;

  const [negotiation, setNegotiation] = React.useState<NegotiationState | null>(null);
  const [contract, setContract] = React.useState<ContractState | null>(null);

  const negotiationId = `neg_${assetId}`;
  const contractId = `contract_${assetId}`;

  // Data listeners
  React.useEffect(() => {
    const unsubNegotiation = onSnapshot(doc(db, 'negociacoes', negotiationId), (docSnap) => {
        if (docSnap.exists()) {
            setNegotiation(docSnap.data() as NegotiationState);
        } else {
            const initialState = { status: 'draft' };
            setDoc(doc(db, 'negociacoes', negotiationId), initialState);
        }
    });

    const unsubContract = onSnapshot(doc(db, 'contracts', contractId), (docSnap) => {
        if (docSnap.exists()) {
            setContract(docSnap.data() as ContractState);
        } else {
            const initialState: ContractState = {
                isFrozen: false,
                fields: {
                    seller: { paymentMethod: 'vista', installments: '1', interestPercent: '0' },
                    buyer: { razaoSocial: '', cnpj: '', ie: '', endereco: '' }
                },
                sellerAgrees: false,
                buyerAgrees: false,
                verifications: { seller: 'pending', buyer: 'pending' },
                uploads: { seller: [], buyer: [] }
            };
            setDoc(doc(db, 'contracts', contractId), initialState);
        }
    });

    return () => {
        unsubNegotiation();
        unsubContract();
    };
  }, [negotiationId, contractId]);
  
  if (!asset) {
    return <div className="flex items-center justify-center h-screen"><Loader2 className="h-16 w-16 animate-spin"/></div>
  }

  const currentUserRole: UserRole | null = (asset && 'ownerId' in asset && currentUser?.uid === asset.ownerId) ? 'seller' : 'buyer';

  const updateContractState = async (updates: Partial<ContractState> | any) => {
    if (!contract) return;
    const docRef = doc(db, 'contracts', contractId);
    await setDoc(docRef, updates, { merge: true });
  };
  
  const handleFieldChange = (role: UserRole, field: string, value: any) => {
    if (contract?.isFrozen || currentUserRole !== role) return;
    const path = `fields.${role}.${field}`;
    updateContractState({ [path]: value });
  };

  const finalContractText = React.useMemo(() => {
      if (!asset || !contract) return "Carregando pré-visualização...";
      // Mock party data
      const mockParties = {
        seller: { name: 'Fazenda Rio Verde', doc: '12.345.678/0001-99', address: 'Zona Rural, s/n, Alta Floresta, MT', ie: '123456789', repName: 'João da Silva', repDoc: '111.222.333-44', repRole: 'Sócio Administrador' },
        buyer: { 
            name: contract.fields.buyer.razaoSocial, 
            doc: contract.fields.buyer.cnpj, 
            address: contract.fields.buyer.endereco,
            ie: contract.fields.buyer.ie
        }
      }
      return getContractTemplate(assetType, asset, contract, mockParties);

  }, [asset, assetType, contract]);


  const handleAccept = async () => {
    if (!contract || !currentUserRole) return;
    
    const updates: Partial<ContractState> = {};
    if (currentUserRole === 'seller') updates.sellerAgrees = true;
    if (currentUserRole === 'buyer') updates.buyerAgrees = true;

    await updateContractState(updates);

    const bothAgreed = (currentUserRole === 'seller' && contract.buyerAgrees) || (currentUserRole === 'buyer' && contract.sellerAgrees);
    if (bothAgreed) {
        await updateContractState({ isFrozen: true, frozenAt: new Date().toISOString() });
        toast({ title: "Contrato Congelado!", description: "Ambas as partes aceitaram. E-mails de verificação foram enviados." });
    } else {
        toast({ title: "Acordo Registrado", description: "Aguardando a outra parte aceitar para finalizar o contrato." });
    }
  };

  const handleSendVerificationEmail = (role: UserRole) => {
    // In a real app, this would trigger a server-side function
    console.log(`Simulating sending verification email to ${role}`);
    toast({
      title: "E-mail de verificação enviado!",
      description: `Um e-mail foi enviado para o ${role} com instruções para validar o contrato.`,
    });
  };

  if (!negotiation || !contract) {
    return <div className="flex items-center justify-center h-screen"><Loader2 className="h-16 w-16 animate-spin"/></div>
  }
  
  const { isFrozen, fields, sellerAgrees, buyerAgrees, verifications, uploads } = contract;
  const isSeller = currentUserRole === 'seller';
  const isBuyer = currentUserRole === 'buyer';
  const bothVerified = verifications.buyer === 'validated' && verifications.seller === 'validated';
  const bothUploaded = uploads.seller.length > 0 && uploads.seller.length > 0;

  const handleGenerateDuplicates = () => toast({ title: "Funcionalidade em desenvolvimento."});
  const handleFinalizeContract = () => toast({ title: "Funcionalidade em desenvolvimento."});
  const handleFileUpload = (role: UserRole) => toast({ title: "Funcionalidade em desenvolvimento."});
  

  return (
    <div className="container mx-auto max-w-4xl py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <Button variant="outline" asChild>
            <Link href={`/negociacao?id=${assetId}`}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar para a Negociação
            </Link>
        </Button>
      </div>
      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-2xl">
                <FileSignature className="h-8 w-8" />
                Ajuste e Fechamento do Contrato
            </CardTitle>
            <CardDescription>
                Revise os termos, preencha seus campos, e confirme o acordo para finalizar o contrato.
            </CardDescription>
          </CardHeader>
        </Card>
        
        {/* Preview Section */}
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Pré-visualização do Contrato</CardTitle>
                <Button variant="ghost" size="icon"><Download className="h-4 w-4"/></Button>
            </CardHeader>
            <CardContent>
                <div className="h-[50vh] overflow-y-auto p-4 border rounded-lg bg-secondary/20 text-xs font-mono">
                    <p className="whitespace-pre-wrap">{finalContractText}</p>
                </div>
            </CardContent>
        </Card>

        {/* Form Fields Section */}
        <div className="space-y-8">
            {/* --- PASSO 1: PREENCHIMENTO --- */}
            <Card className={cn(isFrozen && "opacity-60 pointer-events-none")}>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5"/>1. Preenchimento de Campos</CardTitle>
                    <CardDescription>Cada parte preenche os campos sob sua responsabilidade.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Seção do Vendedor */}
                    <div className={cn("p-4 border rounded-lg", isSeller ? 'bg-background' : 'bg-muted/40')}>
                        <h4 className="font-semibold mb-2">Campos do Vendedor</h4>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Método de Pagamento</Label>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2">
                                        <Checkbox id="vista" checked={fields.seller.paymentMethod === 'vista'} onCheckedChange={() => handleFieldChange('seller', 'paymentMethod', 'vista')} disabled={!isSeller || isFrozen} />
                                        <Label htmlFor="vista">À Vista</Label>
                                    </div>
                                     <div className="flex items-center gap-2">
                                        <Checkbox id="parcelado" checked={fields.seller.paymentMethod === 'parcelado'} onCheckedChange={() => handleFieldChange('seller', 'paymentMethod', 'parcelado')} disabled={!isSeller || isFrozen}/>
                                        <Label htmlFor="parcelado">Parcelado</Label>
                                    </div>
                                </div>
                            </div>
                            {fields.seller.paymentMethod === 'parcelado' && (
                                <>
                                    <div className="space-y-2">
                                        <Label htmlFor="installments">Número de Parcelas</Label>
                                        <Input id="installments" type="number" value={fields.seller.installments} onChange={(e) => handleFieldChange('seller', 'installments', e.target.value)} disabled={!isSeller || isFrozen}/>
                                    </div>
                                     <div className="space-y-2">
                                        <Label htmlFor="interest">Taxa de Juros Mensal (%)</Label>
                                        <Input id="interest" type="number" value={fields.seller.interestPercent} onChange={(e) => handleFieldChange('seller', 'interestPercent', e.target.value)} disabled={!isSeller || isFrozen} />
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                    {/* Seção do Comprador */}
                    <div className={cn("p-4 border rounded-lg", isBuyer ? 'bg-background' : 'bg-muted/40')}>
                        <h4 className="font-semibold mb-2">Campos do Comprador</h4>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="buyer-razao-social">Razão Social</Label>
                                <Input id="buyer-razao-social" value={fields.buyer.razaoSocial} onChange={(e) => handleFieldChange('buyer', 'razaoSocial', e.target.value)} disabled={!isBuyer || isFrozen} />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="buyer-cnpj">CNPJ</Label>
                                <Input id="buyer-cnpj" value={fields.buyer.cnpj} onChange={(e) => handleFieldChange('buyer', 'cnpj', e.target.value)} disabled={!isBuyer || isFrozen} />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="buyer-ie">Inscrição Estadual</Label>
                                <Input id="buyer-ie" value={fields.buyer.ie} onChange={(e) => handleFieldChange('buyer', 'ie', e.target.value)} disabled={!isBuyer || isFrozen} />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="buyer-endereco">Endereço Completo</Label>
                                <Input id="buyer-endereco" value={fields.buyer.endereco} onChange={(e) => handleFieldChange('buyer', 'endereco', e.target.value)} disabled={!isBuyer || isFrozen} />
                            </div>
                        </div>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button className="w-full" onClick={handleAccept} disabled={isFrozen || (isBuyer && buyerAgrees) || (isSeller && sellerAgrees)}>
                        <CheckCircle className="mr-2 h-4 w-4"/>
                        {isFrozen ? "Termos Aceitos" : `Aceitar Termos e Propor Contrato como ${currentUserRole === 'buyer' ? 'Comprador' : 'Vendedor'}`}
                    </Button>
                </CardFooter>
            </Card>

             {/* --- PASSO 2: VERIFICAÇÃO --- */}
             <Card className={cn(!isFrozen && "opacity-60 pointer-events-none")}>
                 <CardHeader>
                    <CardTitle className="flex items-center gap-2"><MailCheck className="h-5 w-5"/>2. Verificação por E-mail</CardTitle>
                    <CardDescription>Após o aceite de ambos, a validação por e-mail é necessária para prosseguir.</CardDescription>
                 </CardHeader>
                 <CardContent className="grid grid-cols-2 gap-4">
                    <AuthStatusIndicator 
                        role="seller" 
                        status={verifications.seller}
                        currentUserRole={currentUserRole}
                        onSendVerification={handleSendVerificationEmail}
                    />
                    <AuthStatusIndicator 
                        role="buyer" 
                        status={verifications.buyer}
                        currentUserRole={currentUserRole}
                        onSendVerification={handleSendVerificationEmail}
                    />
                 </CardContent>
             </Card>

            {/* --- PASSO 3: UPLOADS E FINALIZAÇÃO --- */}
            <Card className={cn(!bothVerified && "opacity-60 pointer-events-none")}>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><FileUp className="h-5 w-5"/>3. Documentos e Duplicatas</CardTitle>
                    <CardDescription>Anexe os documentos assinados e gere as duplicatas para finalizar.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                   <div className="grid grid-cols-2 gap-4">
                       <div className={cn("space-y-2", isSeller ? 'bg-background' : 'bg-muted/40', "p-4 rounded-lg border")}>
                            <h4 className="font-semibold text-sm">Contrato do Vendedor</h4>
                           <div className="h-24 border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-center p-2 cursor-pointer" onClick={() => isSeller && handleFileUpload('seller')}>
                               <UploadCloud className="h-6 w-6 text-muted-foreground"/>
                               <p className="text-xs text-muted-foreground mt-1">Anexar Contrato Assinado</p>
                           </div>
                       </div>
                        <div className={cn("space-y-2", isBuyer ? 'bg-background' : 'bg-muted/40', "p-4 rounded-lg border")}>
                           <h4 className="font-semibold text-sm">Contrato do Comprador</h4>
                           <div className="h-24 border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-center p-2 cursor-pointer" onClick={() => isBuyer && handleFileUpload('buyer')}>
                               <UploadCloud className="h-6 w-6 text-muted-foreground"/>
                               <p className="text-xs text-muted-foreground mt-1">Anexar Contrato Assinado</p>
                           </div>
                       </div>
                   </div>
                   <Button className="w-full" variant="outline" onClick={handleGenerateDuplicates} disabled={!bothVerified}>
                        <Fingerprint className="mr-2 h-4 w-4"/>Gerar Duplicatas Autenticadas
                    </Button>
                </CardContent>
                <CardFooter>
                   <Button className="w-full" size="lg" onClick={handleFinalizeContract} disabled={!bothUploaded}>
                       <Lock className="mr-2 h-4 w-4"/>
                       Finalizar Contrato e Transação
                   </Button>
                </CardFooter>
            </Card>
        </div>
      </div>
    </div>
  );
}

export default AdjustmentClientPage;
