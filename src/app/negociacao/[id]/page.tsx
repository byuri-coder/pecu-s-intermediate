'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import { NegotiationChat } from '../negotiation-chat';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function NegotiationPage() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  if (!id) {
    return <div>ID da negociação não encontrado.</div>;
  }

  return (
    <div className="container mx-auto p-4 h-[calc(100vh_-_8rem)]">
      <Card className="h-full flex flex-col">
        <CardHeader>
            <CardTitle>
                Negociação #{id}
            </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 p-0">
             <NegotiationChat chatId={id} />
        </CardContent>
      </Card>
    </div>
  );
}
