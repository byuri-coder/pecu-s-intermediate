import { Suspense } from 'react';
import NegotiationHubClient from './NegotiationHubClient';

export default function NegotiationPage() {
  return (
    <Suspense fallback={<div className="flex h-screen w-full items-center justify-center">Carregando chat de negociação...</div>}>
      <NegotiationHubClient />
    </Suspense>
  );
}
