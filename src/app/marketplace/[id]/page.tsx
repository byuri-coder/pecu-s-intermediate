// This file is being removed and replaced by the negotiation page.
// The content will be in /negociacao/[id]/page.tsx
// To maintain routing, we will redirect from credit detail pages to the new negotiation page.

import { redirect } from 'next/navigation';
import { placeholderCredits } from '@/lib/placeholder-data'; // Importe no topo, junto com os outros!

export default function MarketplaceDetailPage({ params }: { params: { id: string } }) {
  // Note: O nome da função do componente pode ser CreditDetailPage ou MarketplaceDetailPage,
  // mas o importante é que ela aceite 'params' e faça o redirecionamento.
  redirect(`/negociacao/${params.id}?type=marketplace-item`); // Adicionei 'type' para consistência, se necessário.
}

export async function generateStaticParams() {
  // Esta função deve retornar uma lista de todos os IDs de itens do marketplace
  // que você quer que o Next.js pré-gere como páginas estáticas para redirecionamento.
  // Usaremos 'placeholderCredits' novamente, assumindo que seus IDs do marketplace
  // são os mesmos que os IDs de crédito ou que essa página só redireciona baseada nesses IDs.

  return placeholderCredits.map((credit) => ({
    id: credit.id,
  }));
}