import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const email = request.nextUrl.searchParams.get('email');
  const role = request.nextUrl.searchParams.get('role');
  const baseUrl = process.env.NEXT_PUBLIC_APP_BASE_URL || 'http://localhost:3000';

  if (!email || !role) {
    // Redirect to a generic error page on the frontend if params are missing
    return NextResponse.redirect(`${baseUrl}/aceite-erro`);
  }

  try {
    // In a real application, you would save the acceptance to your database.
    // For this example, we'll just log it.
    console.log(`Aceite registrado para ${email} como ${role} em ${new Date().toISOString()}`);
    
    /*
    Example database logic:
    const acceptanceData = {
      email,
      role,
      acceptedAt: new Date(),
      // You would also link this to the specific contract/negotiation ID
    };
    await db.collection('acceptances').add(acceptanceData);
    */

    // Redirect to a success page. The frontend will handle the rest.
    // We are passing the role back to the frontend so it knows which party was verified.
    // Note: The negotiation ID would be needed here for a specific redirect.
    // For now, we redirect to a generic success page and let the user navigate.
    return NextResponse.redirect(`${baseUrl}/aceite-sucesso`);

  } catch (error) {
    console.error('Erro de registro de aceite:', error);
    // Redirect to an error page on the frontend
    return NextResponse.redirect(`${baseUrl}/aceite-erro`);
  }
}
