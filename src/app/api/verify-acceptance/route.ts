
import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { getFirestore, doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { app } from '@/lib/firebase';

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
    console.log(`Registrando aceite no Firestore para ${email} como ${role} no ativo ${assetId}`);
    
    const db = getFirestore(app);
    const contractRef = doc(db, "contracts", assetId);

    // Update the specific role's acceptance status in Firestore
    await updateDoc(contractRef, {
      [`acceptances.${role}.accepted`]: true,
      [`acceptances.${role}.email`]: email,
      [`acceptances.${role}.acceptedAt`]: serverTimestamp(),
      'updatedAt': serverTimestamp(),
    });

    console.log('Aceite registrado com sucesso no Firestore.');
    
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
