import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.EMAIL_JWT_SECRET || 'your-super-secret-jwt-key';

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');
  const baseUrl = process.env.NEXT_PUBLIC_APP_BASE_URL || 'http://localhost:3000';

  if (!token) {
    // Redirect to an error page on the frontend if no token is provided
    return NextResponse.redirect(`${baseUrl}/aceite-erro`);
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, JWT_SECRET) as { email: string; role: 'buyer' | 'seller' };

    // Here, you would save the acceptance to your database (e.g., Firestore)
    // For this example, we'll just log it.
    console.log(`Aceite registrado para ${decoded.email} como ${decoded.role} em ${new Date().toISOString()}`);
    /*
    Example Firestore code:
    import { getFirestore } from 'firebase-admin/firestore';
    const db = getFirestore();
    await db.collection('contract_acceptances').add({
      email: decoded.email,
      role: decoded.role,
      acceptedAt: new Date(),
    });
    */

    // Redirect to the success page on the frontend, passing the role
    const successUrl = new URL(`${baseUrl}/negociacao/some-id/ajuste`); // Placeholder ID
    successUrl.searchParams.set('acceptance', 'success');
    successUrl.searchParams.set('role', decoded.role);
    
    // You would typically get the negotiation ID from the token or another source
    // to redirect to the correct negotiation page. For now, we redirect to a placeholder.
    // In a real app, you would reconstruct the original URL:
    // e.g., /negociacao/{asset.id}/ajuste

    return NextResponse.redirect(`${baseUrl}/aceite-sucesso`);

  } catch (error) {
    console.error('Erro de verificação de token:', error);
    // Redirect to an error page on the frontend
    return NextResponse.redirect(`${baseUrl}/aceite-erro`);
  }
}
