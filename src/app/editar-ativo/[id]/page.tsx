'use client';

import { notFound, useSearchParams, useParams } from 'next/navigation';
import { placeholderCredits, placeholderRuralLands, placeholderTaxCredits } from '@/lib/placeholder-data';
import type { CarbonCredit, RuralLand, TaxCredit } from '@/lib/types';
import * as React from 'react';
import { EditAssetForm } from './edit-asset-form';


type AssetType = 'carbon-credit' | 'tax-credit' | 'rural-land';

type Asset = CarbonCredit | TaxCredit | RuralLand | null;


function getAssetDetails(id: string, type: AssetType): Asset {
    let localItems: any[] = [];
    if (typeof window !== 'undefined') {
        const storageKey = `${type.replace('-', '_')}s`;
        const localData = localStorage.getItem(storageKey);
        if (localData) {
            try {
                localItems = JSON.parse(localData);
            } catch(e) {
                console.error("Failed to parse local data:", e);
            }
        }
    }

    const localAsset = localItems.find(item => item.id === id);
    if (localAsset) return localAsset as Asset;

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

export default function EditAssetPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id ?? '';
  const assetType = (searchParams?.get('type') as AssetType) || 'carbon-credit';
  
  const [asset, setAsset] = React.useState<Asset | null | 'loading'>('loading');

  React.useEffect(() => {
    if (id && assetType) {
      const assetDetails = getAssetDetails(id, assetType);
      setAsset(assetDetails);
    }
  }, [id, assetType]);
  

  if (asset === 'loading') {
    return <div>Carregando...</div>;
  }

  if (!asset) {
    notFound();
  }

  return <EditAssetForm asset={asset} assetType={assetType} />;
}
