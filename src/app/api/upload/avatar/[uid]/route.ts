// src/app/api/upload/avatar/[uid]/route.ts

import { NextResponse } from 'next/server';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { app } from '@/lib/firebase';
import { connectDB } from '@/lib/mongodb';
import { Usuario } from '@/models/Usuario';

export const runtime = 'nodejs';

// Initialize Firebase Storage
const storage = getStorage(app);

export async function POST(req: Request, { params }: { params: { uid: string } }) {
  try {
    const { uid } = params;
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 });
    }

    if (!file.type.startsWith('image/')) {
        return NextResponse.json({ error: 'Tipo de arquivo inválido. Apenas imagens são permitidas.' }, { status: 400 });
    }

    // Connect to MongoDB to fetch old avatar info for deletion
    await connectDB();
    const userDoc = await Usuario.findOne({ uidFirebase: uid }).lean();

    // If an old avatar URL exists and it's a Firebase Storage URL, delete the old file
    if (userDoc?.avatarId && userDoc.avatarId.includes('firebasestorage.googleapis.com')) {
        try {
            const oldFileRef = ref(storage, userDoc.avatarId);
            await deleteObject(oldFileRef);
        } catch (error: any) {
            // Log error if deletion fails, but don't block the upload of the new avatar
            if (error.code !== 'storage/object-not-found') {
                console.warn(`Falha ao deletar avatar antigo para o usuário ${uid}:`, error.message);
            }
        }
    }
    
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Create a unique file path in Firebase Storage
    const fileRef = ref(storage, `avatars/${uid}/${Date.now()}_${file.name}`);

    // Upload to Storage
    await uploadBytes(fileRef, buffer, { contentType: file.type });

    // Get the public URL
    const downloadURL = await getDownloadURL(fileRef);

    // Update the user document in MongoDB with the new public URL
    await Usuario.updateOne(
        { uidFirebase: uid },
        { $set: { avatarId: downloadURL } },
        { upsert: true }
    );
    
    // Return the URL to the frontend
    return NextResponse.json({ photoURL: downloadURL });

  } catch (error: any) {
    console.error('Erro no upload do avatar:', error);
    return NextResponse.json({ error: 'Erro interno no servidor', details: error.message }, { status: 500 });
  }
}
