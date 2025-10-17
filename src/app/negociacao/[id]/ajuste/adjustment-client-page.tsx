
'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ArrowLeft, FileSignature, CheckCircle, XCircle, Banknote, Download, FileText, UploadCloud, X, Eye, Lock, MailCheck, Loader2, AlertTriangle, RefreshCw, Users, Fingerprint, Film } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import type { CarbonCredit, RuralLand, TaxCredit, Duplicata, CompletedDeal } from '@/lib/types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { numberToWords } from '@/lib/number-to-words';
import { Seal } from '@/components/ui/seal';
import Image from 'next/image';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getAuth } from 'firebase/auth';


type AssetType = 'carbon-credit' | 'tax-credit' | 'rural-land';
type Asset = CarbonCredit | TaxCredit | RuralLand;
type UserRole = 'buyer' | 'seller';


const INVOICE_COUNTER_KEY = 'invoice_global_counter';

// Helper component for file upload display
const FileUploadDisplay = ({
  file,
  onFileChange,
  onClear,
  acceptedTypes,
  maxSize,
  isReadOnly = false,
  label,
  disabled = false,
}: {
  file: File | null;
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onClear: () => void;
  acceptedTypes: string;
  maxSize: string;
  isReadOnly?: boolean;
  label: string;
  disabled?: boolean;
}) => {
  const inputRef = React.useRef<HTMLInputElement>(null);
  
  const handleDownload = () => {
    if (file && typeof window !== "undefined") {
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
     if (file && typeof window !== "undefined") {
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
            {!isReadOnly && !disabled && (
                <Button variant="ghost" size="icon" onClick={onClear} className="h-7 w-7 text-muted-foreground">
                    <X className="h-4 w-4" />
                </Button>
            )}
        </div>
      </div>
    );
  }

  if (isReadOnly || disabled) {
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


type AuthStatus = 'pending' | 'validated' | 'expired';

type NegotiationState = {
  sellerAgrees: boolean;
  buyerAgrees: boolean;
  isFinalized: boolean;
  isTransactionComplete: boolean;
  sellerEmail: string;
  buyerEmail: string;
  paymentMethod: 'vista' | 'parcelado';
  numberOfInstallments: string;
  duplicates: Duplicata[];
  authStatus: Record<'buyer' | 'seller', AuthStatus>;
  contractFields: any;
};

const AuthStatusIndicator = React.memo(({ 
    role, 
    authStatus,
    email,
    onEmailChange,
    onSendVerification,
    isSendingEmail,
}: { 
    role: 'buyer' | 'seller';
    authStatus: AuthStatus;
    email: string;
    onEmailChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSendVerification: () => void;
    isSendingEmail: boolean;
}) => {
    let content;
    switch (authStatus) {
        case 'validated':
            content = <span className="flex items-center gap-1.5 text-xs text-green-700 font-medium"><CheckCircle className="h-4 w-4"/> Validado</span>;
            break;
        case 'expired':
            content = (
                <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1.5 text-xs text-destructive font-medium"><XCircle className="h-4 w-4"/> Expirado</span>
                    <Button size="sm" variant="link" className="text-xs h-auto p-0" onClick={onSendVerification}>Reenviar</Button>
                </div>
            );
            break;
        default: // pending
            content = <span className="text-xs text-muted-foreground font-medium flex items-center gap-1.5"><RefreshCw className="h-3 w-3 animate-spin"/>Pendente</span>;
            break;
    }

    const isFieldDisabled = isSendingEmail;

    return (
         <div className={cn("p-4 rounded-lg border", authStatus === 'validated' ? "bg-green-50 border-green-200" : authStatus === 'expired' ? "bg-destructive/10 border-destructive/20" : "bg-secondary/30")}>
            <div className="flex items-center justify-between mb-2">
                <p className="font-semibold">{role === 'buyer' ? 'Comprador' : 'Vendedor'}</p>
                {content}
            </div>
            <div className="flex items-center gap-2">
                <Input 
                  type="email" 
                  placeholder={`email.${role}@exemplo.com`} 
                  value={email} 
                  onChange={onEmailChange} 
                  disabled={isFieldDisabled}
                />
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={onSendVerification} 
                  disabled={isFieldDisabled || !email}
                >
                    {isSendingEmail ? <Loader2 className="h-4 w-4 animate-spin"/> : 'Verificar'}
                </Button>
            </div>
        </div>
    );
});
AuthStatusIndicator.displayName = 'AuthStatusIndicator';

function AdjustmentClientPage({ asset, assetType }: { asset: Asset, assetType: AssetType }) {
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const router = useRouter();
  
  const negotiationId = `neg_${asset.id}`;
  
  const auth = getAuth();
  const currentUser = auth.currentUser;

  const [negotiationState, setNegotiationState] = React.useState<NegotiationState | null>(null);
  const [loading, setLoading] = React.useState(true);
  
  const currentUserRole: UserRole = currentUser?.uid === asset.ownerId ? 'seller' : 'buyer';
  const isSeller = currentUserRole === 'seller';
  const isBuyer = currentUserRole === 'buyer';
  
  const [isSendingEmail, setIsSendingEmail] = React.useState(false);

  // const [buyerProofFile, setBuyerProofFile] = React.useState<File | null>(null);
  // const [sellerProofFile, setSellerProofFile] = React.useState<File | null>(null);
  // const [signedContractBuyer, setSignedContractBuyer] = React.useState<File | null>(null);
  // const [signedContractSeller, setSignedContractSeller] = React.useState<File | null>(null);

  // Effect to fetch and listen to negotiation state from Firestore
  React.useEffect(() => {
    const docRef = doc(db, 'negociacoes', negotiationId);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
            setNegotiationState(docSnap.data() as NegotiationState);
        } else {
            // Document doesn't exist, create it with initial state
            const initialState: NegotiationState = {
                sellerAgrees: false,
                buyerAgrees: false,
                isFinalized: false,
                isTransactionComplete: false,
                sellerEmail: 'vendedor@example.com',
                buyerEmail: 'comprador@example.com',
                paymentMethod: 'vista',
                numberOfInstallments: '2',
                duplicates: [],
                authStatus: { buyer: 'pending', seller: 'pending' },
                contractFields: { /* initial fields */ },
            };
            setDoc(docRef, initialState).then(() => setNegotiationState(initialState));
        }
        setLoading(false);
    });

    return () => unsubscribe();
  }, [negotiationId]);

  const updateNegotiationState = async (updates: Partial<NegotiationState>) => {
    if (!negotiationState) return;
    const docRef = doc(db, 'negociacoes', negotiationId);
    await setDoc(docRef, { ...negotiationState, ...updates }, { merge: true });
  };
  
  const getNextInvoiceNumber = () => {
    if (typeof window === 'undefined') return '000001';
    let currentCounter = parseInt(window.localStorage.getItem(INVOICE_COUNTER_KEY) || '0', 10);
    currentCounter++;
    window.localStorage.setItem(INVOICE_COUNTER_KEY, currentCounter.toString());
    return currentCounter.toString().padStart(6, '0');
  }

  const handleGenerateDuplicates = React.useCallback(() => {
    if(!negotiationState) return;

    const totalValue = 'price' in asset && asset.price ? asset.price : ('amount' in asset ? asset.amount : 0);
    if (totalValue === 0) return;

    let newDuplicates: Duplicata[] = [];
    const issueDate = new Date();
    const invoiceNumber = getNextInvoiceNumber();

    const transactionHash = `0x${[...Array(64)].map(() => Math.floor(Math.random() * 16).toString(16)).join('')}`;
    const blockTimestamp = new Date().toISOString();

    if (negotiationState.paymentMethod === 'vista') {
        newDuplicates.push({
            orderNumber: '1/1',
            invoiceNumber: invoiceNumber,
            issueDate: issueDate.toLocaleDateString('pt-BR'),
            dueDate: 'À VISTA',
            value: totalValue,
            blockchain: { transactionHash, blockTimestamp }
        });
    } else {
        const installments = parseInt(negotiationState.numberOfInstallments, 10);
        if (isNaN(installments) || installments <= 0) return;
        
        const installmentValue = totalValue / installments;
        for (let i = 1; i <= installments; i++) {
            const dueDate = new Date(issueDate);
            dueDate.setMonth(dueDate.getMonth() + i);
            newDuplicates.push({
                orderNumber: `${String(i).padStart(3, '0')}/${String(installments).padStart(3, '0')}`,
                invoiceNumber: invoiceNumber,
                issueDate: issueDate.toLocaleDateString('pt-BR'),
                dueDate: dueDate.toLocaleDateString('pt-BR'),
                value: installmentValue,
                blockchain: { transactionHash, blockTimestamp }
            });
        }
    }
    updateNegotiationState({ duplicates: newDuplicates });
  }, [asset, negotiationState]);

  React.useEffect(() => {
    if(negotiationState?.isFinalized && negotiationState.duplicates.length === 0) {
        handleGenerateDuplicates();
    }
  }, [negotiationState?.isFinalized, negotiationState?.duplicates.length, handleGenerateDuplicates]);
  

  const getContractTemplateInfo = () => {
    return { template: "...", title: 'Contrato de Exemplo' };
  }
  
  const id = asset.id;
  const assetName = 'title' in asset ? asset.title : `Crédito de ${'taxType' in asset ? asset.taxType : 'creditType' in asset ? asset.creditType : ''}`;
  const sellerName = 'owner' in asset ? asset.owner : ('sellerName' in asset ? asset.sellerName : 'Vendedor');
  const { title: contractTitle } = getContractTemplateInfo();

  const getFinalContractText = React.useCallback(() => {
    return '...'; // Simplified for brevity
  }, []); // Dependencies would go here

  const finalContractText = getFinalContractText();

  
  const handleFinalize = async () => {
    handleGenerateDuplicates();
    await updateNegotiationState({ isFinalized: true });
    toast({
        title: "Contrato Finalizado!",
        description: "O contrato foi bloqueado para edições. Prossiga para a autenticação por e-mail.",
    });
    if (typeof window !== "undefined") {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }
  };
    
  const handleDownloadPdf = () => {
    if (typeof window !== "undefined") {
        const doc = new jsPDF();
        doc.text("Contrato de Exemplo", 10, 10);
        doc.save("contrato.pdf");
    }
  };

  const handleFinishTransaction = () => {
      updateNegotiationState({ isTransactionComplete: true });
      router.push('/dashboard');
  };
    
  const handleSendVerificationEmail = async (role: 'buyer' | 'seller') => {
        const email = role === 'buyer' ? negotiationState?.buyerEmail : negotiationState?.sellerEmail;
        if (!email) {
            toast({ title: `E-mail do ${role} não fornecido`, variant: "destructive"});
            return;
        }
        setIsSendingEmail(true);
        try {
            // In a real app, you would make an API call to your backend to send the email
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // On success, update state in Firestore
            await updateNegotiationState({
                authStatus: { ...negotiationState!.authStatus, [role]: 'pending' }
            });
            toast({ title: "E-mail de verificação enviado!" });
        } catch (error: any) {
            if (typeof console !== 'undefined') {
              console.error(error);
            }
            toast({ title: "Erro ao enviar e-mail", description: error.message, variant: "destructive" });
        } finally {
            setIsSendingEmail(false);
        }
    }
  
  if (loading || !negotiationState) {
      return <div className="flex items-center justify-center h-full"><Loader2 className="h-16 w-16 animate-spin"/></div>
  }
  
  const { isFinalized, sellerAgrees, buyerAgrees, paymentMethod, numberOfInstallments, authStatus } = negotiationState;

  if (searchParams.get('view') === 'archive') {
      return (
        <div className="container mx-auto max-w-4xl py-8 px-4 sm:px-6 lg:px-8">
            {/* Archive View JSX... */}
        </div>
      )
  }

  return (
    <div className="container mx-auto max-w-7xl py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
            <Button variant="outline" asChild>
                <Link href={`/negociacao/${id}?type=${assetType}`}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Voltar para a Negociação
                </Link>
            </Button>
        </div>
      <div className="space-y-8">
          <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-3">
                    <FileSignature className="h-8 w-8" />
                    Ajuste Fino e Fechamento do Contrato
                </CardTitle>
                <CardDescription>
                    Revise os termos, preencha os campos e confirme o acordo para finalizar o contrato.
                </CardDescription>
            </CardHeader>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-8">
                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5"/>Partes Envolvidas</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label>Vendedor (Cedente)</Label>
                            <Input value={sellerName} disabled />
                        </div>
                        <div>
                            <Label>Comprador (Cessionário)</Label>
                            <Input value={currentUser?.displayName || "Comprador Anônimo"} disabled />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Banknote className="h-5 w-5"/>Termos de Pagamento</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                         <div className="flex items-center space-x-4">
                            <Label>Método de Pagamento:</Label>
                            <div className="flex items-center space-x-2">
                                <Checkbox id="vista" checked={paymentMethod === 'vista'} onCheckedChange={() => !isFinalized && updateNegotiationState({ paymentMethod: 'vista' })} disabled={isFinalized}/>
                                <Label htmlFor="vista">À Vista</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                 <Checkbox id="parcelado" checked={paymentMethod === 'parcelado'} onCheckedChange={() => !isFinalized && updateNegotiationState({ paymentMethod: 'parcelado' })} disabled={isFinalized}/>
                                <Label htmlFor="parcelado">Parcelado</Label>
                            </div>
                        </div>
                        {paymentMethod === 'parcelado' && (
                            <div className="space-y-2">
                                <Label htmlFor="installments">Número de Parcelas</Label>
                                <Input id="installments" type="number" value={numberOfInstallments} onChange={(e) => !isFinalized && updateNegotiationState({ numberOfInstallments: e.target.value })} disabled={isFinalized}/>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><CheckCircle className="h-5 w-5"/>Acordo e Assinaturas</CardTitle>
                        <CardDescription>Ambas as partes devem marcar que concordam com os termos para finalizar o contrato.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className={cn("flex items-center space-x-2 p-4 rounded-md border", isSeller ? 'bg-background' : 'bg-secondary/30')}>
                            <Checkbox id="seller-agrees" checked={sellerAgrees} onCheckedChange={(checked) => !isFinalized && isSeller && updateNegotiationState({ sellerAgrees: !!checked })} disabled={isFinalized || !isSeller} />
                            <Label htmlFor="seller-agrees" className="flex-1">O VENDEDOR declara que leu e concorda com todos os termos deste contrato.</Label>
                        </div>
                        <div className={cn("flex items-center space-x-2 p-4 rounded-md border", isBuyer ? 'bg-background' : 'bg-secondary/30')}>
                            <Checkbox id="buyer-agrees" checked={buyerAgrees} onCheckedChange={(checked) => !isFinalized && isBuyer && updateNegotiationState({ buyerAgrees: !!checked })} disabled={isFinalized || !isBuyer} />
                            <Label htmlFor="buyer-agrees" className="flex-1">O COMPRADOR declara que leu e concorda com todos os termos deste contrato.</Label>
                        </div>
                    </CardContent>
                     <CardFooter className="flex justify-end">
                        <Button 
                            size="lg" 
                            className="w-full" 
                            disabled={!sellerAgrees || !buyerAgrees || isFinalized}
                            onClick={handleFinalize}
                        >
                            {isFinalized ? <Lock className="mr-2 h-5 w-5"/> : <CheckCircle className="mr-2 h-5 w-5"/>}
                            {isFinalized ? 'Contrato Finalizado' : 'Aceitar e Finalizar Contrato'}
                        </Button>
                    </CardFooter>
                </Card>

            </div>
             <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5"/>Minuta do Contrato</CardTitle>
                        <div className="flex gap-2">
                             <Button variant="outline" size="sm" onClick={handleDownloadPdf}>
                                <Download className="mr-2 h-4 w-4"/> PDF
                             </Button>
                        </div>
                    </div>
                    <CardDescription>
                        Pré-visualização do documento de {contractTitle}.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Textarea
                        value={finalContractText}
                        readOnly={isFinalized}
                        rows={25}
                        className="bg-secondary/20 text-xs font-mono"
                    />
                </CardContent>
            </Card>
        </div>

       {isFinalized && (
        <div className="mt-8 space-y-6">
           <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><MailCheck className="h-5 w-5"/>Autenticação de Contrato</CardTitle>
                    <CardDescription>Para segurança, cada parte deve confirmar a autenticidade do contrato via e-mail. O link expira em 24 horas.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                         <AuthStatusIndicator 
                            role="seller" 
                            authStatus={authStatus.seller}
                            email={negotiationState.sellerEmail}
                            onEmailChange={(e) => updateNegotiationState({ sellerEmail: e.target.value })}
                            onSendVerification={() => handleSendVerificationEmail('seller')}
                            isSendingEmail={isSendingEmail}
                        />
                        <AuthStatusIndicator 
                            role="buyer"
                            authStatus={authStatus.buyer}
                            email={negotiationState.buyerEmail}
                            onEmailChange={(e) => updateNegotiationState({ buyerEmail: e.target.value })}
                            onSendVerification={() => handleSendVerificationEmail('buyer')}
                            isSendingEmail={isSendingEmail}
                        />
                    </div>
                </CardContent>
            </Card>
        </div>
      )}
    </div>
  );
}

export default AdjustmentClientPage;
