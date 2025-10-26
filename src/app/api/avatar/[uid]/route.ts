// src/app/api/avatar/[uid]/route.ts
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Usuario } from '@/models/Usuario';

export const runtime = 'nodejs';

export async function GET(req: Request, { params }: { params: { uid: string } }) {
  try {
    await connectDB();
    const { uid } = params;
    
    if (!uid) {
      return new NextResponse("UID do usuário é obrigatório.", { status: 400 });
    }

    const user = await Usuario.findOne({ uidFirebase: uid }).lean();

    if (!user || !user.fotoPerfil?.data) {
      // Retorna uma imagem padrão ou um erro 404
      // Para este caso, vamos redirecionar para um placeholder genérico
      return NextResponse.redirect(`https://avatar.vercel.sh/${uid}.png`);
    }

    return new NextResponse(user.fotoPerfil.data, {
      headers: {
        'Content-Type': user.fotoPerfil.contentType || 'image/png',
        'Cache-Control': 'public, max-age=604800, immutable', // Cache de 1 semana
      },
    });
  } catch (err: any) {
    console.error('Erro ao buscar avatar do MongoDB:', err);
    return new NextResponse('Erro interno ao buscar imagem.', { status: 500 });
  }
}
