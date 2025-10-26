// src/app/api/avatar/[uid]/route.ts
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Usuario } from '@/models/Usuario';

export const runtime = 'nodejs';

export async function GET(req: Request, { params }: { params: { uid: string } }) {
  try {
    const { uid } = params;
    if (!uid) {
      return new NextResponse("UID do usuário é obrigatório.", { status: 400 });
    }
    
    await connectDB();
    const user = await Usuario.findOne({ uidFirebase: uid }).lean();

    if (!user || !user.fotoPerfil?.data) {
      // Retorna uma imagem de fallback ou um erro 404
      const fallbackUrl = `https://avatar.vercel.sh/${uid}.png?text=${user?.nome?.charAt(0) || '?'}`;
      return NextResponse.redirect(fallbackUrl);
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
