

'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ArrowLeft, FileSignature, CheckCircle, XCircle, Copy, Banknote, Download, FileText, FileDown, UploadCloud, X, Eye, Lock, Edit, MailCheck, Loader2, AlertTriangle, RefreshCw, Users, BadgePercent, Verified, Fingerprint, Trash2, Video, Film } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import type { CarbonCredit, RuralLand, TaxCredit, Duplicata, CompletedDeal } from '@/lib/types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
const DUPLICATAS_STORAGE_KEY = 'completed_deals_with_duplicates';

const carbonCreditContractTemplate = `CONTRATO DE CESSÃO DE CRÉDITOS DE CARBONO...`; // (content omitted for brevity)
const ruralLandSaleContractTemplate = `CONTRATO PARTICULAR DE PROMESSA DE COMPRA E VENDA DE IMÓVEL RURAL...`; // (content omitted for brevity)
const ruralLandLeaseContractTemplate = `CONTRATO DE ARRENDAMENTO RURAL...`; // (content omitted for brevity)
const ruralLandPermutaContractTemplate = `INSTRUMENTO PARTICULAR DE CONTRATO DE PERMUTA...`; // (content omitted for brevity)

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

export function AdjustmentClientPage({ asset, assetType }: { asset: Asset, assetType: AssetType }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  
  const negotiationId = `neg_${asset.id}`;
  
  const auth = getAuth();
  const currentUser = auth.currentUser;

  const [negotiationState, setNegotiationState] = React.useState<NegotiationState | null>(null);
  const [loading, setLoading] = React.useState(true);
  
  const currentUserRole: UserRole = currentUser?.uid === asset.ownerId ? 'seller' : 'buyer';
  const isSeller = currentUserRole === 'seller';
  const isBuyer = currentUserRole === 'buyer';
  
  const [isSendingEmail, setIsSendingEmail] = React.useState(false);

  const [buyerProofFile, setBuyerProofFile] = React.useState<File | null>(null);
  const [sellerProofFile, setSellerProofFile] = React.useState<File | null>(null);
  const [signedContractBuyer, setSignedContractBuyer] = React.useState<File | null>(null);
  const [signedContractSeller, setSignedContractSeller] = React.useState<File | null>(null);

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
  }, [asset, negotiationState, negotiationId]);

  React.useEffect(() => {
    if(negotiationState?.paymentMethod || negotiationState?.numberOfInstallments) {
        handleGenerateDuplicates();
    }
  }, [negotiationState?.paymentMethod, negotiationState?.numberOfInstallments, handleGenerateDuplicates]);
  

  const getContractTemplateInfo = () => {
    if (assetType === 'rural-land' && 'businessType' in asset) {
        if(asset.businessType === 'Venda') return { template: ruralLandSaleContractTemplate, title: 'Venda de Imóvel Rural' };
        if(asset.businessType === 'Arrendamento') return { template: ruralLandLeaseContractTemplate, title: 'Arrendamento Rural' };
        if(asset.businessType === 'Permuta') return { template: ruralLandPermutaContractTemplate, title: 'Permuta de Imóveis' };
    }
    return { template: carbonCreditContractTemplate, title: 'Cessão de Créditos' };
  }
  
  const id = asset.id;
  const assetName = 'title' in asset ? asset.title : `Crédito de ${'taxType' in asset ? asset.taxType : 'creditType' in asset ? asset.creditType : ''}`;
  const sellerName = 'owner' in asset ? asset.owner : asset.sellerName;
  const negotiatedValue = 'price' in asset && asset.price ? asset.price : ('amount' in asset ? asset.amount : 50000);
  const platformFeePercentage = negotiatedValue <= 100000 ? 1.5 : 1;
  const platformCost = negotiatedValue * (platformFeePercentage / 100);
  const { template: contractTemplate, title: contractTitle } = getContractTemplateInfo();

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
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  };
    
  const handleDownloadPdf = () => { /* ... implementation ... */ };
  const handleDownloadDocx = () => { /* ... implementation ... */ };

  const handleFinishTransaction = () => {
      //... implementation ...
      updateNegotiationState({ isTransactionComplete: true });
  };
    
  const handleSendVerificationEmail = async (role: 'buyer' | 'seller') => {
        const email = role === 'buyer' ? negotiationState?.buyerEmail : negotiationState?.sellerEmail;
        if (!email) {
            toast({ title: `E-mail do ${role} não fornecido`, variant: "destructive"});
            return;
        }
        setIsSendingEmail(true);
        try {
            // ... (API call logic remains the same)
            // On success, update state in Firestore
            await updateNegotiationState({
                authStatus: { ...negotiationState!.authStatus, [role]: 'pending' }
            });
            toast({ title: "E-mail de verificação enviado!" });
        } catch (error) {
            console.error(error);
            toast({ title: "Erro ao enviar e-mail", variant: "destructive" });
        } finally {
            setIsSendingEmail(false);
        }
    }
  
  if (loading || !negotiationState) {
      return <div className="flex items-center justify-center h-full"><Loader2 className="h-16 w-16 animate-spin"/></div>
  }
  
  const { isFinalized } = negotiationState;

  if (searchParams.get('view') === 'archive') {
      return (
        <div className="container mx-auto max-w-4xl py-8 px-4 sm:px-6 lg:px-8">
            {/* Archive View JSX... */}
        </div>
      )
  }

  return (
    <div className="container mx-auto max-w-7xl py-8 px-4 sm:px-6 lg:px-8">
      {/* Main Adjustment Page JSX... using negotiationState where needed */}
      <div className="flex justify-end">
          <Button 
              size="lg" 
              className="w-full" 
              disabled={!negotiationState.sellerAgrees || !negotiationState.buyerAgrees || isFinalized}
              onClick={handleFinalize}
          >
              {isFinalized ? <Lock className="mr-2 h-5 w-5"/> : <CheckCircle className="mr-2 h-5 w-5"/>}
              {isFinalized ? 'Contrato Finalizado' : 'Aceitar e Finalizar Contrato'}
          </Button>
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
                            authStatus={negotiationState.authStatus.seller}
                            email={negotiationState.sellerEmail}
                            onEmailChange={(e) => updateNegotiationState({ sellerEmail: e.target.value })}
                            onSendVerification={() => handleSendVerificationEmail('seller')}
                            isSendingEmail={isSendingEmail}
                        />
                        <AuthStatusIndicator 
                            role="buyer"
                            authStatus={negotiationState.authStatus.buyer}
                            email={negotiationState.buyerEmail}
                            onEmailChange={(e) => updateNegotiationState({ buyerEmail: e.target.value })}
                            onSendVerification={() => handleSendVerificationEmail('buyer')}
                            isSendingEmail={isSendingEmail}
                        />
                    </div>
                </CardContent>
            </Card>
            {/* ... other sections that depend on isFinalized */}
        </div>
      )}
    </div>
  );
}

