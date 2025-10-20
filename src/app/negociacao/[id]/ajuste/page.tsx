
import AdjustmentClientPage from './adjustment-client-page';
import type { Asset, AssetType } from '@/lib/types';
import { notFound } from 'next/navigation';
import { placeholderCredits, placeholderRuralLands, placeholderTaxCredits } from '@/lib/placeholder-data';


// In a real app, this would fetch from a database or a secure API.
async function getAssetDetails(id: string, type: AssetType): Promise<Asset | null> {
  try {
    // First, try fetching from the API
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/anuncios/get/${id}`, { cache: 'no-store' });
    if (response.ok) {
      const data = await response.json();
      if (data.ok && data.anuncio.tipo === type) {
          const anuncio = data.anuncio;
          const formattedAsset = {
            ...anuncio,
            id: anuncio._id.toString(),
            ...anuncio.metadados,
            ownerId: anuncio.uidFirebase,
            price: anuncio.price,
            pricePerCredit: anuncio.price, // Map price to pricePerCredit for carbon credits
            images: anuncio.imagens, // Map imagens to images
          };
          return formattedAsset as Asset;
      }
    }
  } catch (error) {
    console.warn("Server-side API call failed, falling back to placeholders. Error:", error);
  }

  // Fallback to placeholder data if API fails or doesn't find it
  console.log(`Falling back to placeholder data for asset ID ${id} and type ${type}`);
  let placeholderData: Asset | undefined;
  if (type === 'carbon-credit') {
    placeholderData = placeholderCredits.find(c => c.id === id);
  } else if (type === 'rural-land') {
    placeholderData = placeholderRuralLands.find(l => l.id === id);
  } else if (type === 'tax-credit') {
    placeholderData = placeholderTaxCredits.find(t => t.id === id);
  }
  
  return placeholderData || null;
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
