
import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';

// This API route is now simplified. Its only job is to redirect the user
// back to the adjustment page with the correct query parameters to indicate
// a successful email verification. The frontend will handle the state change.
export async function GET(request: NextRequest) {
  const role = request.nextUrl.searchParams.get('role');
  const assetId = request.nextUrl.searchParams.get('assetId');
  const assetType = request.nextUrl.searchParams.get('assetType');
  const email = request.nextUrl.searchParams.get('email');
  
  const baseUrl = process.env.NEXT_PUBLIC_APP_BASE_URL || 'http://localhost:3000';

  if (!role || !assetId || !assetType || !email) {
    console.error('Missing required query parameters for acceptance verification.', { role, assetId, assetType, email });
    // Redirect to a generic error page if parameters are missing
    return NextResponse.redirect(`${baseUrl}/aceite-erro`);
  }
  
  // Log the validation action on the server side
  console.log(`VALIDATION: ${email} validou o contrato para o ativo ${assetId}.`);

  // Construct the success URL to redirect the user back to the contract adjustment page.
  // The frontend will use these parameters to update its state.
  const successUrl = new URL(`${baseUrl}/negociacao/${assetId}/ajuste`);
  successUrl.searchParams.set('type', assetType);
  successUrl.searchParams.set('acceptance', 'success');
  successUrl.searchParams.set('role', role);

  console.log(`Redirecting user to: ${successUrl.toString()}`);

  return NextResponse.redirect(successUrl);
}
