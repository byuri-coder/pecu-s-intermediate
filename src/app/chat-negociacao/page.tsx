"use client";

import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

// Dynamically import the main client component with SSR turned off
// This is crucial to prevent re-renders on input changes within the chat components.
const NegotiationHubPageClient = dynamic(
  () => import('./NegotiationHubPageClient').then(mod => mod.NegotiationHubPageClient),
  { 
    ssr: false,
    loading: () => (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin" />
      </div>
    )
  }
);

export default function NegotiationHubPage() {
  return (
    <Suspense fallback={<div className="flex h-screen w-full items-center justify-center">Carregando negociações...</div>}>
      <NegotiationHubPageClient />
    </Suspense>
  );
}
