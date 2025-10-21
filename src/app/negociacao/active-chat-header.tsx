'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Edit,
  UserCircle
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { Conversation, AssetType, Asset } from '@/lib/types';

function getAssetTypeRoute(type: AssetType) {
  switch (type) {
    case 'carbon-credit':
      return '/credito-de-carbono';
    case 'tax-credit':
      return '/tributos';
    case 'rural-land':
      return '/terras-rurais';
  }
}

export function ActiveChatHeader({
  conversation,
  assetId,
}: {
  conversation: Conversation;
  assetId: string;
}) {
  return (
    <CardHeader className="flex-row items-center justify-between">
      <Sheet>
        <SheetTrigger asChild>
          <div className="flex items-center gap-3 cursor-pointer group">
            <Avatar className="h-11 w-11">
              <AvatarImage src={conversation.avatar} />
              <AvatarFallback>{conversation.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-xl group-hover:underline">
                {conversation.name}
              </CardTitle>
              <CardDescription>
                Negociando:{' '}
                <Link
                  className="text-primary hover:underline"
                  href={`${getAssetTypeRoute(conversation.type)}/${assetId}`}
                >
                  {conversation.assetName}
                </Link>
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
                    <AvatarImage src={conversation.avatar} />
                    <AvatarFallback>
                      <UserCircle className="h-8 w-8" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-lg font-semibold">{conversation.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      Membro desde 2023
                    </p>
                    <p className="text-sm text-muted-foreground">Verificado</p>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </div>
        </SheetContent>
      </Sheet>
      <div className="space-x-2">
        <Button variant="outline" size="sm" asChild>
          <Link href={`/negociacao/${assetId}/ajuste-contrato?type=${conversation.type}`}>
            <Edit className="mr-2 h-4 w-4" /> ajustar e fechar contrato
          </Link>
        </Button>
      </div>
    </CardHeader>
  );
}
