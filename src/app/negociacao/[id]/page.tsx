
import { placeholderCredits, placeholderRuralLands, placeholderTaxCredits } from '@/lib/placeholder-data';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Landmark, Handshake, ThumbsUp, ThumbsDown, Edit, FileSignature, Upload, Download, Paperclip, Send } from 'lucide-react';
import { NegotiationChat } from './negotiation-chat';
import { Input } from '@/components/ui/input';
import { ChatList } from '../chat-list';

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


export default function NegotiationPage({ params, searchParams }: { params: { id: string }, searchParams: { type: AssetType } }) {
  const assetType = searchParams.type || 'carbon-credit';
  const asset = getAssetDetails(params.id, assetType);
  
  if (!asset) {
    notFound();
  }

  const assetName = 'title' in asset ? asset.title : `Crédito de ${'taxType' in asset ? asset.taxType : asset.creditType}`;
  const sellerName = 'owner' in asset ? asset.owner : asset.sellerName;


  return (
    <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-4 h-[calc(100vh-10rem)] container mx-auto max-w-7xl py-8 px-4 sm:px-6 lg:px-8">
        {/* Coluna da Lista de Chats (visível em mobile, escondida em desktop) */}
        <div className="md:hidden h-full">
             <ChatList />
        </div>
        
        {/* Coluna da Lista de Chats (visível em desktop) */}
        <div className="hidden md:block md:col-span-1 lg:col-span-2 h-full">
            <ChatList />
        </div>

        {/* Coluna do Chat e Ações */}
        <div className="md:col-span-3 lg:col-span-3 h-full flex flex-col gap-4">
            <Card className="flex-grow flex flex-col">
                <CardHeader className="flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-xl">{sellerName}</CardTitle>
                        <CardDescription>
                            Negociando: <Link className="text-primary hover:underline" href={`${getAssetTypeRoute(assetType)}/${asset.id}`}>{assetName}</Link>
                        </CardDescription>
                    </div>
                     <div className="space-x-2">
                        <Button variant="outline" size="sm" className="bg-green-100 hover:bg-green-200 text-green-800 border-green-300"><ThumbsUp className="mr-2 h-4 w-4"/> Aceitar</Button>
                        <Button variant="outline" size="sm"><Edit className="mr-2 h-4 w-4"/> Ajustar</Button>
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
