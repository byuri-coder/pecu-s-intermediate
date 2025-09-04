// This file is being removed and replaced by the negotiation page.
// The content will be in /negociacao/[id]/page.tsx
// To maintain routing, we will redirect from credit detail pages to the new negotiation page.
import { redirect } from 'next/navigation';

export default function CreditDetailPage({ params }: { params: { id: string } }) {
  redirect(`/negociacao/${params.id}`);
}
