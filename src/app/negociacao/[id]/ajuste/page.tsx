
import AdjustmentClientPage from './adjustment-client-page';
import type { AssetType } from '@/lib/types';

// This is a Server Component. It can directly access params and searchParams from props.
export default function AdjustmentPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const id = params.id;
  // Provide a default assetType if it's missing from the searchParams
  const assetType = (searchParams?.type as AssetType) || 'carbon-credit';

  // Pass the server-side props to the client component.
  return <AdjustmentClientPage assetId={id} assetType={assetType} />;
}
