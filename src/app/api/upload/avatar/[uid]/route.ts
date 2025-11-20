
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
    
    // In a real project, this would upload to a persistent storage service (Firebase Storage, S3, Cloudinary).
    // For this environment, we'll simulate this by creating a unique ID and a placeholder URL.
    const storageId = `profile-photos/${uid}-${Date.now()}-${file.name}`;
    const publicImageUrl = `/api/avatar/${uid}?t=${Date.now()}`; // The URL our server will use to serve the image reference

    await connectDB();

    const user = await Usuario.findOne({ uidFirebase: uid });

    // If an old photo exists, its storageId would be used here to delete it from the storage service.
    if (user && user.profilePhoto?.storageId) {
      // await deleteFromStorage(user.profilePhoto.storageId);
      console.log(`Simulating deletion of old avatar: ${user.profilePhoto.storageId}`);
    }

    // Update the user with the new profile picture metadata.
    const updatedUser = await Usuario.findOneAndUpdate(
      { uidFirebase: uid },
      { 
        $set: { 
          profilePhoto: {
            url: publicImageUrl,
            storageId: storageId,
            updatedAt: new Date(),
          } 
        } 
      },
      { upsert: true, new: true }
    );
    
    // Return the public URL for the frontend to use for immediate UI update.
    return NextResponse.json({ success: true, url: updatedUser.profilePhoto.url });

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

    const user = await Usuario.findOne({ uidFirebase: uid });

    // If a photo exists, its storageId would be used here to delete it from the storage service.
    if (user && user.profilePhoto?.storageId) {
      // await deleteFromStorage(user.profilePhoto.storageId);
       console.log(`Simulating deletion of avatar from storage: ${user.profilePhoto.storageId}`);
    }

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
