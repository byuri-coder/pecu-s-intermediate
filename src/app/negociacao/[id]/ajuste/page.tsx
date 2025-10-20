
import AdjustmentClientPage from './adjustment-client-page';
import type { Asset, AssetType } from '@/lib/types';
import { notFound } from 'next/navigation';

// Placeholder: In a real app, this would fetch from a database or a secure API.
async function getAssetDetails(id: string, type: AssetType): Promise<Asset | null> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/anuncios/get/${id}`, { cache: 'no-store' });
    if (!response.ok) {
      console.error(`API call failed with status: ${response.status}`);
      return null;
    }
    const data = await response.json();
    if (data.ok && data.anuncio.tipo === type) {
        const anuncio = data.anuncio;
        // The data from mongo has _id, but our type expects id.
        const formattedAsset = {
          ...anuncio,
          id: anuncio._id.toString(),
          ...anuncio.metadados,
          ownerId: anuncio.uidFirebase, // Ensure ownerId is mapped
        };
        // Specific mapping for carbon credits if needed
        if (formattedAsset.tipo === 'carbon-credit') {
           formattedAsset.pricePerCredit = formattedAsset.price;
        }
        return formattedAsset as Asset;
    }
    return null;
  } catch (error) {
    console.error("Server-side failed to fetch asset details", error);
    return null;
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
