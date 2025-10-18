
import AdjustmentClientPage from './adjustment-client-page';
import type { AssetType } from '@/lib/types';

// This is a Server Component. It can directly access params and searchParams from props.
export default function AdjustmentPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { type?: string; view?: string };
}) {
  const id = params.id;
  // Provide a default assetType if it's missing from the searchParams
  const assetType = (searchParams?.type as AssetType) || 'carbon-credit';

  if (!id || !assetType) {
    // This should ideally not happen if routing is correct, but it's a good safeguard.
    return <div>Parâmetros inválidos. O ID e o tipo do ativo são necessários.</div>;
  }

  // Pass the server-side props to the client component.
  return <AdjustmentClientPage assetId={id} assetType={assetType} />;
}
