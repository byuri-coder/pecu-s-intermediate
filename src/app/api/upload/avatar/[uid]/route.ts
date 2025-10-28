// src/app/api/upload/avatar/[uid]/route.ts
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Usuario } from '@/models/Usuario';

export const runtime = 'nodejs';

// This route handles both POST (upload) and DELETE operations for a user's avatar.

// POST: Handles uploading a new avatar.
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
    
    // In a real project, this would upload to a persistent storage service (Firebase Storage, S3).
    // For this environment, we'll generate a placeholder URL that points back to our serving endpoint.
    // The timestamp acts as a cache-buster.
    const publicImageUrl = `/api/avatar/${uid}?t=${Date.now()}`;

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


// DELETE: Handles deleting the reference to the user's current avatar.
export async function DELETE(req: Request, { params }: { params: { uid: string } }) {
  try {
    const { uid } = params;
    if (!uid) {
      return NextResponse.json({ error: 'UID do usuário ausente.' }, { status: 400 });
    }
    
    await connectDB();

    // "Delete" the avatar by nullifying the URL field in the database.
    // This prevents the old image from being served.
    await Usuario.findOneAndUpdate(
      { uidFirebase: uid },
      { $set: { fotoPerfilUrl: null } }
    );
    
    return NextResponse.json({ success: true, message: "Referência da foto de perfil removida." });

  } catch (error: any) {
    console.error('Erro ao deletar avatar:', error);
    return NextResponse.json({ error: 'Erro interno no servidor', details: error.message }, { status: 500 });
  }
}
