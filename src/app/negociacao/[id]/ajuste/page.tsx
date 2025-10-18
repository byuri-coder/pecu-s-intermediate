
'use client';

import { notFound, useSearchParams, useParams } from 'next/navigation';
import AdjustmentClientPage from './adjustment-client-page';
import type { CarbonCredit, RuralLand, TaxCredit } from '@/lib/types';
import * as React from 'react';


type AssetType = 'carbon-credit' | 'tax-credit' | 'rural-land';
type Asset = CarbonCredit | TaxCredit | RuralLand | null;


async function getAssetDetails(id: string, type: AssetType): Promise<Asset> {
    try {
      const response = await fetch(`/api/anuncios/get/${id}`);
      if (!response.ok) {
        return null;
      }
      const data = await response.json();
      if (data.ok) {
        const anuncio = data.anuncio;
        const formattedAsset = {
            ...anuncio,
            id: anuncio._id,
            ...anuncio.metadados,
        };
        // Specific mappings for different asset types if needed
        if (formattedAsset.tipo === 'carbon-credit') {
            formattedAsset.pricePerCredit = formattedAsset.price;
        }
        return formattedAsset as Asset;
      }
      return null;
    } catch (error) {
      console.error("Failed to fetch asset details", error);
      return null;
    }
}

export default function AdjustmentPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const assetType = (searchParams.get('type') as AssetType) || 'carbon-credit';
  
  const [asset, setAsset] = React.useState<Asset | 'loading'>('loading');

  React.useEffect(() => {
    if (id && assetType) {
      getAssetDetails(id, assetType).then(assetData => {
        setAsset(assetData);
      });
    }
  }, [id, assetType]);
  

  if (asset === 'loading') {
    return <div>Carregando...</div>;
  }

  if (!asset) {
    notFound();
  }

  return <AdjustmentClientPage asset={asset} assetType={assetType} />;
}
