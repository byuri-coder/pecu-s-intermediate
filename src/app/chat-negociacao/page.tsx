
import { Suspense } from 'react';
import { NegotiationHubPageClient } from './NegotiationHubPageClient';

export default function NegotiationHubPage() {
  return (
    <Suspense fallback={<div className="flex h-screen w-full items-center justify-center">Carregando negociações...</div>}>
      <NegotiationHubPageClient />
    </Suspense>
  );
}
