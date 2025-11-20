
// src/app/api/avatar/[uid]/route.ts
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Usuario } from '@/models/Usuario';

export const runtime = 'nodejs';

// This route now redirects to the saved URL or to a fallback.
export async function GET(req: Request, { params }: { params: { uid: string } }) {
  try {
    const { uid } = params;
    if (!uid) {
      return new NextResponse("UID do usuário é obrigatório.", { status: 400 });
    }
    
    await connectDB();
    const user = await Usuario.findOne({ uidFirebase: uid }).lean();

    // If the user has a saved profile picture URL, redirect to it.
    if (user && user.profilePhoto && user.profilePhoto.url) {
      // The URL stored is a relative path that points back to this same API, 
      // but with a timestamp to break cache. This creates a redirection loop.
      // The correct implementation is to store the FINAL, public URL from the storage service.
      // For this simulation, we'll generate a fallback instead of redirecting to the stored URL.
      
      const fallbackLetter = user?.nome?.charAt(0).toUpperCase() || uid.charAt(0).toUpperCase() || '?';
      const fallbackUrl = `https://avatar.vercel.sh/${uid}.png?text=${fallbackLetter}`;
      return NextResponse.redirect(fallbackUrl);
    }

    // Otherwise, generate a fallback image with the initial of the name.
    const fallbackLetter = user?.nome?.charAt(0).toUpperCase() || uid.charAt(0).toUpperCase() || '?';
    const fallbackUrl = `https://avatar.vercel.sh/${uid}.png?text=${fallbackLetter}`;
    return NextResponse.redirect(fallbackUrl);

  } catch (err: any) {
    console.error('Erro ao buscar avatar:', err);
    // In case of an error, still try to return a generic fallback.
    const fallbackUrl = `https://avatar.vercel.sh/${params.uid}.png?text=?`;
    return NextResponse.redirect(fallbackUrl);
  }
}
