
'use client';

import * as React from 'react';
import { useSearchParams, notFound, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ArrowLeft, FileSignature, CheckCircle, XCircle, Banknote, MailCheck, Loader2, Lock, RefreshCw, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import type { CarbonCredit, RuralLand, TaxCredit, AssetType } from '@/lib/types';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getAuth } from 'firebase/auth';

type Asset = CarbonCredit | TaxCredit | RuralLand;
type UserRole = 'buyer' | 'seller';


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
  authStatus: Record<'buyer' | 'seller', AuthStatus>;
  contractFields: Record<string, unknown>;
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

export function AdjustmentClientPage({ assetId, assetType }: { assetId: string, assetType: AssetType }) {
  const searchParams = useSearchParams();
  const { toast } = useToast();
  
  const auth = getAuth();
  const currentUser = auth.currentUser;

  const [asset, setAsset] = React.useState<Asset | null | 'loading'>('loading');
  const [negotiationState, setNegotiationState] = React.useState<NegotiationState | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [isSendingEmail, setIsSendingEmail] = React.useState(false);

  const negotiationId = `neg_${assetId}`;

  // Fetch asset details
  React.useEffect(() => {
    async function getAssetDetails(id: string) {
        setAsset('loading');
        try {
          const response = await fetch(`/api/anuncios/get/${id}`);
          if (!response.ok) {
            setAsset(null);
            setLoading(false);
            return;
          }
          const data = await response.json();
          if (data.ok) {
            const anuncio = data.anuncio;
            const formattedAsset = {
                ...anuncio,
                id: anuncio._id,
                ...anuncio.metadados,
                ownerId: anuncio.uidFirebase,
            };
            if (formattedAsset.tipo === 'carbon-credit') {
                formattedAsset.pricePerCredit = formattedAsset.price;
            }
            setAsset(formattedAsset as Asset);
          } else {
            setAsset(null);
          }
        } catch (error) {
          console.error("Failed to fetch asset details", error);
          setAsset(null);
        }
        setLoading(false);
    }
    if (assetId) {
      getAssetDetails(assetId);
    } else {
        setLoading(false);
    }
  }, [assetId]);

  // Firestore listener
  React.useEffect(() => {
    if (!asset || asset === 'loading') return;

    const docRef = doc(db, 'negociacoes', negotiationId);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
            setNegotiationState(docSnap.data() as NegotiationState);
        } else {
            const initialState: Omit<NegotiationState, 'duplicates'> & { contractFields: Record<string, unknown> } = {
                sellerAgrees: false,
                buyerAgrees: false,
                isFinalized: false,
                isTransactionComplete: false,
                sellerEmail: 'vendedor@example.com',
                buyerEmail: 'comprador@example.com',
                paymentMethod: 'vista',
                numberOfInstallments: '2',
                authStatus: { buyer: 'pending', seller: 'pending' },
                contractFields: { },
            };
            setDoc(docRef, initialState).then(() => setNegotiationState(initialState as NegotiationState));
        }
        if(asset !== 'loading') setLoading(false);
    });

    return () => unsubscribe();
  }, [negotiationId, asset]);

  const currentUserRole: UserRole | null = asset && asset !== 'loading' && currentUser?.uid === asset.ownerId ? 'seller' : 'buyer';
  const isSeller = currentUserRole === 'seller';
  const isBuyer = currentUserRole === 'buyer';

  const updateNegotiationState = async (updates: Partial<NegotiationState>) => {
    if (!negotiationState) return;
    const docRef = doc(db, 'negociacoes', negotiationId);
    await setDoc(docRef, { ...negotiationState, ...updates }, { merge: true });
  };
  
  const getContractTemplateInfo = () => {
    return { template: "...", title: 'Contrato de Exemplo' };
  }
  
  const getFinalContractText = React.useCallback(() => {
    return '...'; // Simplified for brevity
  }, []); // Dependencies would go here

  const finalContractText = getFinalContractText();

  const handleFinalize = async () => {
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
    
  const handleSendVerificationEmail = async (role: 'buyer' | 'seller') => {
        if (!negotiationState) {
            toast({ title: "Estado de negociação não carregado.", variant: "destructive"});
            return;
        }
        const email = role === 'buyer' ? negotiationState.buyerEmail : negotiationState.sellerEmail;
        if (!email) {
            toast({ title: `E-mail do ${role} não fornecido`, variant: "destructive"});
            return;
        }
        setIsSendingEmail(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            await updateNegotiationState({
                authStatus: { ...negotiationState.authStatus, [role]: 'pending' }
            });
            toast({ title: "E-mail de verificação enviado!" });
        } catch (error) {
            if (error instanceof Error) {
                toast({ title: "Erro ao enviar e-mail", description: error.message, variant: "destructive" });
            }
        } finally {
            setIsSendingEmail(false);
        }
    }
  
  if (asset === 'loading' || loading || !negotiationState) {
      return <div className="flex items-center justify-center h-screen"><Loader2 className="h-16 w-16 animate-spin"/></div>
  }
  
  if (!asset) {
    notFound();
  }

  if (searchParams?.get('view') === 'archive') {
      return (
        <div className="container mx-auto max-w-4xl py-8 px-4 sm:px-6 lg:px-8">
            <div className="mb-6">
                <Button variant="outline" asChild>
                    <Link href={`/dashboard`}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Voltar para o Dashboard
                    </Link>
                </Button>
            </div>
             <Card>
                <CardHeader>
                    <CardTitle>Arquivo da Negociação</CardTitle>
                    <CardDescription>Detalhes e documentos da negociação concluída de {asset && 'title' in asset ? asset.title : 'Ativo'}.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p>Visualização de arquivo de negociação concluída. (Em desenvolvimento)</p>
                </CardContent>
             </Card>
        </div>
      );
  }

  const assetName = 'title' in asset ? asset.title : `Crédito de ${'taxType' in asset ? asset.taxType : 'creditType' in asset ? asset.creditType : ''}`;
  const sellerName = 'owner' in asset ? asset.owner : ('sellerName' in asset ? asset.sellerName : 'Vendedor');
  const { title: contractTitle } = getContractTemplateInfo();
  const { isFinalized, sellerAgrees, buyerAgrees, paymentMethod, numberOfInstallments, authStatus } = negotiationState;

  return (
    <div className="container mx-auto max-w-7xl py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
            <Button variant="outline" asChild>
                <Link href={`/negociacao/${assetId}?type=${assetType}`}>
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
                        <CardTitle>Minuta do Contrato</CardTitle>
                        <div className="flex gap-2">
                             <Button variant="outline" size="sm" onClick={handleDownloadPdf}>
                                PDF
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
  </div>
  );
}

export default AdjustmentClientPage;
