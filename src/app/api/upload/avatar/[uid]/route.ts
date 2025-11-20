
// src/app/api/upload/avatar/[uid]/route.ts
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Usuario } from '@/models/Usuario';

export const runtime = 'nodejs';

// Helper function to read file as base64
const toBase64 = async (file: File): Promise<string> => {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    return `data:${file.type};base64,${buffer.toString('base64')}`;
};

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
    
    // In a real project, this would upload to a persistent storage service (Firebase Storage, S3, Cloudinary).
    // For this simulation, we'll convert the image to a base64 data URI and store that.
    const base64Image = await toBase64(file);
    const storageId = `profile-photos/${uid}-${Date.now()}-${file.name}`; // Still useful for reference

    await connectDB();

    // No need to delete old file as we're not using a real storage service in this simulation.

    // Update the user with the new profile picture metadata.
    const updatedUser = await Usuario.findOneAndUpdate(
      { uidFirebase: uid },
      { 
        $set: { 
          profilePhoto: {
            url: base64Image, // Store the data URI
            storageId: storageId,
            updatedAt: new Date(),
          } 
        } 
      },
      { upsert: true, new: true }
    ).lean();
    
    // Return the public URL that can be used to fetch the image via our API.
    const publicUrl = `/api/avatar/${uid}?t=${new Date().getTime()}`;
    return NextResponse.json({ success: true, url: publicUrl });

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

    // "Delete" the avatar by nullifying the profilePhoto object in the database.
    await Usuario.findOneAndUpdate(
      { uidFirebase: uid },
      { $set: { profilePhoto: { url: null, storageId: null, updatedAt: null } } }
    );
    
    return NextResponse.json({ success: true, message: "Referência da foto de perfil removida." });

  } catch (error: any) {
    console.error('Erro ao deletar avatar:', error);
    return NextResponse.json({ error: 'Erro interno no servidor', details: error.message }, { status: 500 });
  }
}
