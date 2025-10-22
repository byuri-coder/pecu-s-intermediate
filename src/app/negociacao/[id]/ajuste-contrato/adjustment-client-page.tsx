

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
import type { Asset, AssetType, Duplicata, CompletedDeal } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getAuth } from 'firebase/auth';
import { getContractTemplate } from '@/lib/contract-template';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { numberToWords } from '@/lib/number-to-words';
import { Seal } from '@/components/ui/seal';


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
  const [generatedDeal, setGeneratedDeal] = React.useState<CompletedDeal | null>(null);

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

    // Check if the update will result in both parties agreeing
    const bothWillAgree = (updates.sellerAgrees && contract.buyerAgrees) || (updates.buyerAgrees && contract.sellerAgrees);

    if (bothWillAgree) {
        await updateContractState({ isFrozen: true, frozenAt: new Date().toISOString() });
        toast({ title: "Contrato Congelado!", description: "Ambas as partes aceitaram. Agora, proceda com a verificação por e-mail." });
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

  const handleFileUpload = (role: UserRole) => {
    if (currentUserRole !== role) return;
     toast({ title: "Funcionalidade em desenvolvimento."});
     // Simulate upload
     updateContractState({ uploads: { ...contract?.uploads, [role]: [{ name: `contrato_${role}.pdf`, url: '#'}] } });
  };
  
  const handleGenerateDuplicates = () => {
    if (!contract || !asset) return;
    const totalValue = ('price' in asset && asset.price) || (('pricePerCredit' in asset && 'quantity' in asset) ? (asset.pricePerCredit * asset.quantity) : 0);
    const installments = parseInt(contract.fields.seller.installments, 10) || 1;
    const installmentValue = totalValue / installments;
    const today = new Date();

    const duplicates: Duplicata[] = Array.from({ length: installments }, (_, i) => {
        const dueDate = new Date(today);
        dueDate.setMonth(today.getMonth() + i + 1);
        return {
            orderNumber: `${i + 1}/${installments}`,
            invoiceNumber: `NF-${assetId.substring(0, 6)}-${i+1}`,
            issueDate: today.toLocaleDateString('pt-BR'),
            dueDate: dueDate.toLocaleDateString('pt-BR'),
            value: installmentValue
        }
    });
    
    const deal: CompletedDeal = {
        assetId: assetId,
        assetName: 'title' in asset ? asset.title : 'Crédito',
        duplicates,
        seller: { name: "Fazenda Rio Verde", doc: "12.345.678/0001-99", address: "Zona Rural, s/n, Alta Floresta, MT" },
        buyer: { name: contract.fields.buyer.razaoSocial, doc: contract.fields.buyer.cnpj, address: contract.fields.buyer.endereco },
        blockchain: {
            transactionHash: '0x' + [...Array(64)].map(() => Math.floor(Math.random() * 16).toString(16)).join(''),
            blockTimestamp: new Date().toISOString()
        }
    };
    
    setGeneratedDeal(deal);

    // Save to local storage for the duplicates page
    localStorage.setItem('completed_deals_with_duplicates', JSON.stringify([deal]));
    localStorage.setItem('newDuplicatesAvailable', 'true');
    window.dispatchEvent(new Event('storage'));

    toast({ title: "Duplicatas Geradas!", description: "As duplicatas foram criadas e estão prontas para visualização."});
  };

  const handleDownloadDuplicatesPdf = (deal: CompletedDeal) => {
    if (!deal) return;
    const doc = new jsPDF();
    let yPos = 15;

    doc.setFontSize(18);
    doc.text(`Duplicatas do Negócio: ${deal.assetName}`, doc.internal.pageSize.getWidth() / 2, yPos, { align: 'center' });
    yPos += 15;

    deal.duplicates.forEach((dup, index) => {
        if (index > 0) yPos += 10;
        (doc as any).autoTable({
            startY: yPos,
            theme: 'striped',
            headStyles: { fillColor: [34, 139, 34] },
            head: [[`Duplicata ${dup.orderNumber}`]],
            body: [
                ['Fatura Ref.', dup.invoiceNumber],
                ['Vencimento', dup.dueDate],
                ['Valor', formatCurrency(dup.value)],
            ],
            didDrawPage: (data: any) => { yPos = data.cursor.y }
        });
        yPos = (doc as any).autoTable.previous.finalY;
    });

    doc.save(`duplicatas_${deal.assetId}.pdf`);
  };

  const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  if (!negotiation || !contract) {
    return <div className="flex items-center justify-center h-screen"><Loader2 className="h-16 w-16 animate-spin"/></div>
  }
  
  const { isFrozen, fields, sellerAgrees, buyerAgrees, verifications, uploads } = contract;
  const isSeller = currentUserRole === 'seller';
  const isBuyer = currentUserRole === 'buyer';
  const bothAgreed = sellerAgrees && buyerAgrees;
  const bothVerified = verifications.buyer === 'validated' && verifications.seller === 'validated';
  const bothUploaded = uploads.seller.length > 0 && uploads.buyer.length > 0;

  const handleFinalizeContract = () => toast({ title: "Funcionalidade em desenvolvimento."});
  
  return (
    <div className="container mx-auto max-w-4xl py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <Button variant="outline" asChild>
            <Link href={`/chat-negociacao?id=${assetId}`}>
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

        <div className="space-y-8">
            <Card className={cn(isFrozen && "opacity-60 pointer-events-none")}>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5"/>1. Preenchimento e Acordo</CardTitle>
                    <CardDescription>Ambas as partes devem preencher seus campos e aceitar os termos para congelar o contrato e prosseguir.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className={cn("p-4 border rounded-lg", isSeller ? 'bg-background' : 'bg-muted/40')}>
                        <h4 className="font-semibold mb-2">Campos do Vendedor</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                </>
                            )}
                        </div>
                    </div>
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
                        {isFrozen ? "Termos Aceitos" : `Aceitar Termos como ${currentUserRole === 'buyer' ? 'Comprador' : 'Vendedor'}`}
                    </Button>
                </CardFooter>
            </Card>

             <Card className={cn(!bothAgreed && "opacity-50 pointer-events-none")}>
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

            <Card className={cn(!bothVerified && "opacity-50 pointer-events-none")}>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><FileUp className="h-5 w-5"/>3. Documentos e Duplicatas</CardTitle>
                    <CardDescription>Anexe os documentos assinados e gere as duplicatas para finalizar.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                   <div className="grid grid-cols-2 gap-4">
                       <div className={cn("space-y-2 p-4 rounded-lg border", isSeller ? 'bg-background' : 'bg-muted/40')}>
                            <h4 className="font-semibold text-sm">Contrato do Vendedor</h4>
                           <div className="h-24 border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-center p-2 cursor-pointer hover:bg-secondary" onClick={() => handleFileUpload('seller')}>
                               {uploads.seller.length > 0 ? <CheckCircle className="h-6 w-6 text-green-500"/> : <UploadCloud className="h-6 w-6 text-muted-foreground"/>}
                               <p className="text-xs text-muted-foreground mt-1">{uploads.seller.length > 0 ? 'Contrato Anexado' : 'Anexar Contrato Assinado'}</p>
                           </div>
                       </div>
                        <div className={cn("space-y-2 p-4 rounded-lg border", isBuyer ? 'bg-background' : 'bg-muted/40')}>
                           <h4 className="font-semibold text-sm">Contrato do Comprador</h4>
                           <div className="h-24 border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-center p-2 cursor-pointer hover:bg-secondary" onClick={() => handleFileUpload('buyer')}>
                                {uploads.buyer.length > 0 ? <CheckCircle className="h-6 w-6 text-green-500"/> : <UploadCloud className="h-6 w-6 text-muted-foreground"/>}
                               <p className="text-xs text-muted-foreground mt-1">{uploads.buyer.length > 0 ? 'Contrato Anexado' : 'Anexar Contrato Assinado'}</p>
                           </div>
                       </div>
                   </div>
                   <Button className="w-full" variant="outline" onClick={handleGenerateDuplicates} disabled={!bothVerified || generatedDeal !== null}>
                        <Fingerprint className="mr-2 h-4 w-4"/>Gerar Duplicatas Autenticadas
                    </Button>
                </CardContent>
                <CardFooter>
                   <Button className="w-full" size="lg" onClick={handleFinalizeContract} disabled={!bothUploaded || !generatedDeal}>
                       <Lock className="mr-2 h-4 w-4"/>
                       Finalizar Contrato e Transação
                   </Button>
                </CardFooter>
            </Card>

            {generatedDeal && (
                <Card className={cn(!bothUploaded && "opacity-50 pointer-events-none")}>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5"/>4. Duplicatas Geradas</CardTitle>
                        <CardDescription>As duplicatas abaixo foram geradas com base nos termos do contrato. Faça o download e utilize para pagamento.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h4 className="font-semibold">Resumo do Negócio</h4>
                             <Button onClick={() => handleDownloadDuplicatesPdf(generatedDeal)} size="sm">
                                <Download className="mr-2 h-4 w-4" /> Baixar PDF
                            </Button>
                        </div>
                        <div className="p-4 border rounded-lg bg-muted/30 space-y-2 text-sm">
                            <p><strong>Ativo:</strong> {generatedDeal.assetName}</p>
                            <p><strong>Vendedor:</strong> {generatedDeal.seller.name}</p>
                            <p><strong>Comprador:</strong> {generatedDeal.buyer.name}</p>
                        </div>
                         {generatedDeal.duplicates.map((dup, index) => (
                             <div key={index} className="grid grid-cols-4 gap-4 items-center border-b pb-2">
                                <p className="text-sm"><strong>Parcela:</strong> {dup.orderNumber}</p>
                                <p className="text-sm"><strong>Fatura:</strong> {dup.invoiceNumber}</p>
                                <p className="text-sm"><strong>Vencimento:</strong> {dup.dueDate}</p>
                                <p className="text-sm font-bold text-right">{formatCurrency(dup.value)}</p>
                             </div>
                         ))}
                    </CardContent>
                </Card>
            )}

        </div>
      </div>
    </div>
  );
}

export default AdjustmentClientPage;
