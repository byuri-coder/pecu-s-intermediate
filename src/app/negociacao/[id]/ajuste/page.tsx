
'use client';

import { notFound, useSearchParams, useParams } from 'next/navigation';
import AdjustmentClientPage from './adjustment-client-page';
import type { CarbonCredit, RuralLand, TaxCredit } from '@/lib/types';
import * as React from 'react';
import { Loader2 } from 'lucide-react';


type AssetType = 'carbon-credit' | 'tax-credit' | 'rural-land';
type Asset = CarbonCredit | TaxCredit | RuralLand | null;


export default function AdjustmentPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const assetType = (searchParams.get('type') as AssetType) || 'carbon-credit';
  
  const [asset, setAsset] = React.useState<Asset | 'loading'>('loading');

  React.useEffect(() => {
    async function getAssetDetails(id: string, type: AssetType) {
        try {
          const response = await fetch(`/api/anuncios/get/${id}`);
          if (!response.ok) {
            setAsset(null);
            return;
          }
          const data = await response.json();
          if (data.ok) {
            const anuncio = data.anuncio;
            const formattedAsset = {
                ...anuncio,
                id: anuncio._id,
                ...anuncio.metadados,
            };
            if (formattedAsset.tipo === 'carbon-credit') {
                formattedAsset.pricePerCredit = formattedAsset.price;
            }
            setAsset(formattedAsset as Asset);
          } else {
            setAsset(null);
          }
        } catch (error) {
          console.error("Failed to fetch asset details", error);
          setAsset(null);
        }
    }

    if (id && assetType) {
      getAssetDetails(id, assetType);
    }
  }, [id, assetType]);
  

  if (asset === 'loading') {
    return <div className="w-full h-full flex items-center justify-center"><Loader2 className="h-10 w-10 animate-spin" /></div>;
  }

  if (!asset) {
    notFound();
  }

  return <AdjustmentClientPage asset={asset} assetType={assetType} />;
}
