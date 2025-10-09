
import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { getFirestore, doc, updateDoc, serverTimestamp, getDoc } from "firebase/firestore";
import { app } from '@/lib/firebase';

export async function GET(request: NextRequest) {
  const email = request.nextUrl.searchParams.get('email');
  const role = request.nextUrl.searchParams.get('role');
  const assetId = request.nextUrl.searchParams.get('assetId');
  const assetType = request.nextUrl.searchParams.get('assetType');
  const creatorEmail = request.nextUrl.searchParams.get('creator');
  
  const baseUrl = process.env.NEXT_PUBLIC_APP_BASE_URL || 'http://localhost:3000';

  if (!email || !role || !assetId || !assetType || !creatorEmail) {
    console.error('Missing required query parameters for acceptance verification.', { email, role, assetId, assetType, creatorEmail });
    return NextResponse.redirect(`${baseUrl}/aceite-erro`);
  }

  try {
    console.log(`Attempting to register acceptance in Firestore for ${email} as ${role} on asset ${assetId}`);
    
    const db = getFirestore(app);
    // The contract is always stored under the user who created it.
    const contractRef = doc(db, "usuarios", creatorEmail, "contratos", assetId);

    const docSnap = await getDoc(contractRef);

    if (!docSnap.exists()) {
        console.error(`Contract ${assetId} not found for creator user ${creatorEmail}. Redirecting to error page.`);
        return NextResponse.redirect(`${baseUrl}/aceite-erro`);
    }

    // Update the specific role's acceptance status in Firestore
    await updateDoc(contractRef, {
      [`acceptances.${role}.accepted`]: true,
      [`acceptances.${role}.email`]: email,
      [`acceptances.${role}.acceptedAt`]: serverTimestamp(),
      'updatedAt': serverTimestamp(),
    });

    console.log('Acceptance successfully registered in Firestore.');
    
    // Redirect to the adjustment page with success parameters
    const successUrl = new URL(`${baseUrl}/negociacao/${assetId}/ajuste`);
    successUrl.searchParams.set('type', assetType);
    successUrl.searchParams.set('acceptance', 'success');
    successUrl.searchParams.set('role', role);

    return NextResponse.redirect(successUrl);

  } catch (error) {
    console.error('Error registering acceptance in Firestore:', error);
    return NextResponse.redirect(`${baseUrl}/aceite-erro`);
  }
}
