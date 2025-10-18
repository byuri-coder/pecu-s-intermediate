
'use client';

import { useSearchParams, useParams } from 'next/navigation';
import AdjustmentClientPage from './adjustment-client-page';
import type { AssetType } from '@/lib/types';

export default function AdjustmentPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const assetType = (searchParams.get('type') as AssetType) || 'carbon-credit';
  
  if (!id || !assetType) {
    return <div>Parâmetros inválidos.</div>;
  }

  return <AdjustmentClientPage assetId={id} assetType={assetType} />;
}
