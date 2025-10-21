

import AdjustmentClientPage from './adjustment-client-page';
import type { Asset, AssetType } from '@/lib/types';
import { notFound } from 'next/navigation';
import { placeholderCredits, placeholderRuralLands, placeholderTaxCredits } from '@/lib/placeholder-data';


async function getAssetDetails(id: string, type: AssetType): Promise<Asset | null> {
  try {
    const response = await fetch(`http://localhost:3000/api/anuncios/get/${id}`, { cache: 'no-store' });
    if (!response.ok) {
        // If API fails, try to find in placeholder data as a fallback for development
        console.warn(`API call failed, falling back to placeholder data for asset ${id}`);
        const placeholderData = 
            type === 'carbon-credit' ? placeholderCredits.find(c => c.id === id) :
            type === 'tax-credit' ? placeholderTaxCredits.find(t => t.id === id) :
            type === 'rural-land' ? placeholderRuralLands.find(l => l.id === id) :
            null;
        return placeholderData || null;
    }
    const data = await response.json();
    if (data.ok && data.anuncio) {
        const anuncio = data.anuncio;
         return {
            id: anuncio._id,
            ownerId: anuncio.uidFirebase,
            ...anuncio.metadados,
            title: anuncio.titulo,
            description: anuncio.descricao,
            price: anuncio.price,
            status: anuncio.status,
            images: anuncio.imagens,
            pricePerCredit: anuncio.price,
        } as Asset;
    }
    return null;
  } catch (error) {
    console.error("Failed to fetch asset details, falling back to placeholders:", error);
    const placeholderData = 
        type === 'carbon-credit' ? placeholderCredits.find(c => c.id === id) :
        type === 'tax-credit' ? placeholderTaxCredits.find(t => t.id === id) :
        type === 'rural-land' ? placeholderRuralLands.find(l => l.id === id) :
        null;
    return placeholderData || null;
  }
}


// This is a Server Component. It fetches data on the server and passes it to the client component.
export default async function AdjustmentPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const id = params.id;
  const assetType = (searchParams?.type as AssetType);

  if (!assetType) {
    console.warn("Asset type is missing in search params.");
    notFound();
  }

  const asset = await getAssetDetails(id, assetType);

  if (!asset) {
    notFound();
  }

  // Pass the server-fetched props to the client component.
  return <AdjustmentClientPage assetId={id} assetType={assetType} asset={asset} />;
}
