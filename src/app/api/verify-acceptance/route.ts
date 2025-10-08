import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const email = request.nextUrl.searchParams.get('email');
  const role = request.nextUrl.searchParams.get('role');
  const assetId = request.nextUrl.searchParams.get('assetId');
  const assetType = request.nextUrl.searchParams.get('assetType');
  const baseUrl = process.env.NEXT_PUBLIC_APP_BASE_URL || 'http://localhost:3000';

  if (!email || !role || !assetId || !assetType) {
    return NextResponse.redirect(`${baseUrl}/aceite-erro`);
  }

  try {
    // In a real application, you would save the acceptance to your database.
    console.log(`Aceite registrado para ${email} como ${role} em ${new Date().toISOString()}`);
    
    /*
    Example database logic:
    await db.collection('acceptances').add({
      email,
      role,
      assetId,
      assetType,
      acceptedAt: new Date(),
    });
    */

    // Redirect to the adjustment page with success parameters
    const successUrl = new URL(`${baseUrl}/negociacao/${assetId}/ajuste`);
    successUrl.searchParams.set('type', assetType);
    successUrl.searchParams.set('acceptance', 'success');
    successUrl.searchParams.set('role', role);

    return NextResponse.redirect(successUrl);

  } catch (error) {
    console.error('Erro de registro de aceite:', error);
    return NextResponse.redirect(`${baseUrl}/aceite-erro`);
  }
}
