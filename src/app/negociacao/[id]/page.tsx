
import { placeholderCredits, placeholderRuralLands, placeholderTaxCredits } from '@/lib/placeholder-data';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Landmark, Handshake, ThumbsUp, ThumbsDown, Edit, FileSignature, Upload, Download, Paperclip, Send, FileText, ShieldCheck, UserCircle } from 'lucide-react';
import { NegotiationChat } from './negotiation-chat';
import { Input } from '@/components/ui/input';
import { ChatList } from '../chat-list';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';


type AssetType = 'carbon-credit' | 'tax-credit' | 'rural-land';

function getAssetDetails(id: string, type: AssetType) {
    if (type === 'carbon-credit') {
        return placeholderCredits.find((c) => c.id === id);
    }
    if (type === 'tax-credit') {
        return placeholderTaxCredits.find((c) => c.id === id);
    }
    if (type === 'rural-land') {
        return placeholderRuralLands.find((c) => c.id === id);
    }
    return null;
}

function getAssetTypeName(type: AssetType) {
    switch(type) {
        case 'carbon-credit': return 'Crédito de Carbono';
        case 'tax-credit': return 'Crédito Tributário';
        case 'rural-land': return 'Terra Rural';
    }
}

function getAssetTypeRoute(type: AssetType) {
    switch(type) {
        case 'carbon-credit': return '/credito-de-carbono';
        case 'tax-credit': return '/tributos';
        case 'rural-land': return '/terras-rurais';
    }
}


export default async function NegotiationPage({ params, searchParams }: { params: { id: string }, searchParams: { type: AssetType } }) {
  const assetType = searchParams.type || 'carbon-credit';
  const asset = getAssetDetails(params.id, assetType);
  
  if (!asset) {
    notFound();
  }

  const assetName = 'title' in asset ? asset.title : `Crédito de ${'taxType' in asset ? asset.taxType : asset.creditType}`;
  const sellerName = 'owner' in asset ? asset.owner : asset.sellerName;
  const isTaxCredit = assetType === 'tax-credit';

  const sellerAvatar = 'https://picsum.photos/seed/avatar2/40/40'; // Placeholder avatar

  return (
    <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-4 container mx-auto max-w-full py-8 px-4 sm:px-6 lg:px-8 h-full">
        {/* Coluna da Lista de Chats */}
        <div className="md:col-span-4 lg:col-span-3 h-full">
             <ChatList />
        </div>
        
        {/* Coluna do Chat */}
        <div className="md:col-span-8 lg:col-span-9 h-full flex flex-col gap-4">
            <Card className="flex-grow flex flex-col">
                <CardHeader className="flex-row items-center justify-between">
                    <Sheet>
                        <SheetTrigger asChild>
                            <div className="flex items-center gap-3 cursor-pointer group">
                                <Avatar className="h-11 w-11">
                                    <AvatarImage src={sellerAvatar} />
                                    <AvatarFallback>{sellerName.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <CardTitle className="text-xl group-hover:underline">{sellerName}</CardTitle>
                                    <CardDescription>
                                        Negociando: <Link className="text-primary hover:underline" href={`${getAssetTypeRoute(assetType)}/${asset.id}`}>{assetName}</Link>
                                    </CardDescription>
                                </div>
                            </div>
                        </SheetTrigger>
                        <SheetContent className="sm:max-w-md">
                            <SheetHeader>
                                <SheetTitle>Informações do Vendedor</SheetTitle>
                                <SheetDescription>
                                    Perfil e documentos relacionados ao ativo em negociação.
                                </SheetDescription>
                            </SheetHeader>
                            <div className="py-6 space-y-6">
                                <Card>
                                    <CardHeader className="p-4">
                                        <div className="flex items-center gap-4">
                                             <Avatar className="h-16 w-16">
                                                <AvatarImage src={sellerAvatar} />
                                                <AvatarFallback><UserCircle className="h-8 w-8"/></AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <h3 className="text-lg font-semibold">{sellerName}</h3>
                                                <p className="text-sm text-muted-foreground">Membro desde 2023</p>
                                                <p className="text-sm text-muted-foreground">Verificado</p>
                                            </div>
                                        </div>
                                    </CardHeader>
                                </Card>

                                {isTaxCredit && (
                                     <Card>
                                        <CardHeader>
                                            <CardTitle>Documentos do Ativo</CardTitle>
                                            <CardDescription>Acesse os arquivos comprobatórios.</CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                            <div className="flex items-center justify-between p-3 rounded-md border bg-secondary/30">
                                                <div className="flex items-center gap-3">
                                                    <ShieldCheck className="h-6 w-6 text-primary"/>
                                                    <div>
                                                        <p className="font-semibold text-sm">Certidão Negativa de Débitos</p>
                                                        <p className="text-xs text-muted-foreground">cnd_2024.pdf</p>
                                                    </div>
                                                </div>
                                                <Button variant="outline" size="icon">
                                                    <Download className="h-4 w-4"/>
                                                </Button>
                                            </div>
                                            <div className="flex items-center justify-between p-3 rounded-md border bg-secondary/30">
                                                <div className="flex items-center gap-3">
                                                    <FileText className="h-6 w-6 text-primary"/>
                                                    <div>
                                                        <p className="font-semibold text-sm">Documentos Comprobatórios</p>
                                                        <p className="text-xs text-muted-foreground">docs.zip</p>
                                                    </div>
                                                </div>
                                                <Button variant="outline" size="icon">
                                                    <Download className="h-4 w-4"/>
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}
                            </div>
                        </SheetContent>
                    </Sheet>
                     <div className="space-x-2">
                        <Button variant="outline" size="sm" asChild>
                            <Link href={`/negociacao/${params.id}/ajuste?type=${assetType}`}>
                                <Edit className="mr-2 h-4 w-4"/> ajustar e fechar contrato
                            </Link>
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col p-4 pt-0">
                    <NegotiationChat />
                    <div className="mt-4 flex items-center gap-2">
                        <Button variant="ghost" size="icon"><Paperclip className="h-5 w-5" /></Button>
                        <Input placeholder="Digite sua mensagem..." />
                        <Button><Send className="h-5 w-5" /></Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
export async function generateStaticParams() {
    const params: { id: string; type: AssetType }[] = [];
  
    // Créditos de Carbono
    placeholderCredits.forEach(credit => {
      params.push({ id: credit.id, type: 'carbon-credit' });
    });
  
    // Créditos Tributários
    placeholderTaxCredits.forEach(taxCredit => {
      params.push({ id: taxCredit.id, type: 'tax-credit' });
    });
  
    // Terras Rurais
    placeholderRuralLands.forEach(ruralLand => {
      params.push({ id: ruralLand.id, type: 'rural-land' });
    });
  
    return params;
  }

    
