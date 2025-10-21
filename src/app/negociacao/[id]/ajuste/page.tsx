

import AdjustmentClientPage from './adjustment-client-page';
import type { Asset, AssetType } from '@/lib/types';
import { notFound } from 'next/navigation';
import { placeholderCredits, placeholderRuralLands, placeholderTaxCredits } from '@/lib/placeholder-data';


// In a real app, this would fetch from a database or a secure API.
async function getAssetDetails(id: string, type: AssetType): Promise<Asset | null> {
  // This function is simplified to avoid the failing localhost fetch call.
  // In a real database scenario, you would query your DB here directly.
  console.log(`Searching for asset with ID ${id} and type ${type} in placeholder data.`);
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
    // If no asset is found (even in placeholders), we show a 404.
    // This is the expected behavior if the asset doesn't exist.
    // The previous error was because the FETCH was failing, not because the asset was missing.
    notFound();
  }

  // Pass the server-fetched props to the client component.
  return <AdjustmentClientPage assetId={id} assetType={assetType} asset={asset} />;
}
