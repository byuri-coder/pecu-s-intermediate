

import AdjustmentClientPage from './adjustment-client-page';
import type { Asset, AssetType } from '@/lib/types';
import { notFound } from 'next/navigation';
import { placeholderCredits, placeholderRuralLands, placeholderTaxCredits } from '@/lib/placeholder-data';


async function getAssetDetails(id: string, type: AssetType): Promise<Asset | null> {
  // This is a placeholder. In a real app, you would fetch this from your database.
  // The fetch call to localhost was removed to prevent build errors in production environments.
  const placeholderData = 
      type === 'carbon-credit' ? placeholderCredits.find(c => c.id === id) :
      type === 'tax-credit' ? placeholderTaxCredits.find(t => t.id === id) :
      type === 'rural-land' ? placeholderRuralLands.find(l => l.id === id) :
      null;

  if (placeholderData) {
     return {
        ...placeholderData,
        ownerId: placeholderData.ownerId,
        // Ensure all required fields for Asset are mapped
    } as Asset;
  }
  
  return null;
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
