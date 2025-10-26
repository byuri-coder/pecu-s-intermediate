// src/app/api/upload/avatar/[uid]/route.ts
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Usuario } from '@/models/Usuario';

export const runtime = 'nodejs';

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
    
    if (!file.type.startsWith('image/')) {
        return NextResponse.json({ error: 'Tipo de arquivo inválido. Apenas imagens são permitidas.' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    await connectDB();

    await Usuario.findOneAndUpdate(
      { uidFirebase: uid },
      {
        $set: {
          fotoPerfil: {
            data: buffer,
            contentType: file.type,
          },
        },
      },
      { upsert: true, new: true }
    );
    
    const photoURL = `/api/avatar/${uid}?t=${new Date().getTime()}`;

    return NextResponse.json({ success: true, photoURL });

  } catch (error: any) {
    console.error('Erro no upload do avatar para o MongoDB:', error);
    return NextResponse.json({ error: 'Erro interno no servidor', details: error.message }, { status: 500 });
  }
}
