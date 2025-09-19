
import { notFound } from 'next/navigation';
import { placeholderCredits, placeholderRuralLands, placeholderTaxCredits } from '@/lib/placeholder-data';
import { AdjustmentClientPage } from './adjustment-client-page';
import type { CarbonCredit, RuralLand, TaxCredit } from '@/lib/types';


type AssetType = 'carbon-credit' | 'tax-credit' | 'rural-land';

type Asset = CarbonCredit | TaxCredit | RuralLand | null;


function getAssetDetails(id: string, type: AssetType): Asset {
    if (type === 'carbon-credit') {
        return placeholderCredits.find((c) => c.id === id) || null;
    }
    if (type === 'tax-credit') {
        return placeholderTaxCredits.find((c) => c.id === id) || null;
    }
    if (type === 'rural-land') {
        return placeholderRuralLands.find((c) => c.id === id) || null;
    }
    return null;
}

export default function AdjustmentPage({ params, searchParams }: { params: { id: string }, searchParams: { type: AssetType } }) {
  const assetType = searchParams.type || 'carbon-credit';
  const asset = getAssetDetails(params.id, assetType);

  if (!asset) {
    notFound();
  }

  return <AdjustmentClientPage asset={asset} assetType={assetType} />;
}

export async function generateStaticParams() {
  const carbonParams = placeholderCredits.map((credit) => ({
    id: credit.id,
  }));

  const taxParams = placeholderTaxCredits.map((credit) => ({
    id: credit.id,
  }));

  const ruralLandParams = placeholderRuralLands.map((land) => ({
    id: land.id,
  }));

  const allParams = [...carbonParams, ...taxParams, ...ruralLandParams];
  
  // Create a structure that matches what generateStaticParams expects for the 'ajuste' route
  // We only need to provide the 'id' part of the slug. The searchParams are not part of it.
  // Also, we need to avoid duplicates if IDs are shared across asset types.
  const uniqueIds = [...new Set(allParams.map(p => p.id))];

  return uniqueIds.map(id => ({ id }));
}
    