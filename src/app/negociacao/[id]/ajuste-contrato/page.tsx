
'use client';

import type { Asset, AssetType } from '@/lib/types';
import { notFound, useParams, useSearchParams } from 'next/navigation';
import * as React from 'react';
import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

async function getAssetDetails(id: string, type: AssetType): Promise<Asset | null> {
  try {
    const response = await fetch(`/api/anuncios/get/${id}`, { cache: 'no-store' });
    if (!response.ok) {
      console.error(`Failed to fetch asset ${id}, status: ${response.status}`);
      return null;
    }
    const data = await response.json();
    if (data.ok && data.anuncio.tipo === type) {
        const anuncio = data.anuncio;
        return {
            ...anuncio.metadados,
            id: anuncio._id,
            ownerId: anuncio.uidFirebase,
            title: anuncio.titulo,
            description: anuncio.descricao,
            status: anuncio.status,
            price: anuncio.price,
            pricePerCredit: anuncio.price, 
            images: anuncio.imagens || [],
            createdAt: anuncio.createdAt,
        } as Asset;
    }
    return null;
  } catch (error) {
    console.error("Failed to fetch asset details", error);
    return null;
  }
}

const AdjustmentClientPage = dynamic(
  () => import('./adjustment-client-page').then(mod => mod.AdjustmentClientPage),
  { 
    ssr: false,
    loading: () => (
        <div className="flex h-screen w-full items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin" />
        </div>
    )
  }
);


export default function AdjustmentPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id ?? '';
  const assetType = (searchParams?.get('type') as AssetType);

  const [asset, setAsset] = React.useState<Asset | null | 'loading'>('loading');

  React.useEffect(() => {
    if (id && assetType) {
        getAssetDetails(id, assetType).then(setAsset);
    } else {
        setAsset(null);
    }
  }, [id, assetType]);

  if (!assetType) {
    console.warn("Asset type is missing in search params.");
    notFound();
  }

  if (asset === 'loading') {
    return (
        <div className="flex h-screen w-full items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin" />
        </div>
    )
  }

  if (!asset) {
    notFound();
  }

  return <AdjustmentClientPage assetId={id} assetType={assetType} asset={asset} />;
}
