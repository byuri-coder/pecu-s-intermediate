
// src/app/api/upload/avatar/[uid]/route.ts
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Usuario } from '@/models/Usuario';

export const runtime = 'nodejs';

// This route now simulates saving a file and returns a public URL.
// In a real production environment, this would involve saving to a bucket (S3, GCS)
// and getting the URL from there. For this exercise, we'll use a placeholder URL generator.
export async function POST(req: Request, { params }: { params: { uid: string } }) {
  try {
    const { uid } = params;
    if (!uid) {
      return NextResponse.json({ error: 'UID do usuário ausente.' }, { status: 400 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado.' }, { status: 400 });
    }
    
    // Simulation of file saving and URL generation.
    // In a real project, this would upload to Firebase Storage or S3.
    // We'll use a predictable placeholder for demonstration.
    // The query param ensures the browser doesn't use a cached version.
    const publicImageUrl = `https://avatar.vercel.sh/${uid}.png?text=${file.name.substring(0, 1)}&ts=${Date.now()}`;

    await connectDB();

    // Update the user with the new profile picture URL.
    await Usuario.findOneAndUpdate(
      { uidFirebase: uid },
      { $set: { fotoPerfilUrl: publicImageUrl } },
      { upsert: true, new: true }
    );
    
    // Return the public URL for the frontend to use
    return NextResponse.json({ success: true, photoURL: publicImageUrl });

  } catch (error: any) {
    console.error('Erro no upload do avatar:', error);
    return NextResponse.json({ error: 'Erro interno no servidor', details: error.message }, { status: 500 });
  }
}
