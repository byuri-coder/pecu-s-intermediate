// src/app/api/avatar/[uid]/route.ts
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Usuario } from '@/models/Usuario';

export const runtime = 'nodejs';

// Esta rota agora redireciona para a URL salva ou para um fallback.
export async function GET(req: Request, { params }: { params: { uid: string } }) {
  try {
    const { uid } = params;
    if (!uid) {
      return new NextResponse("UID do usuário é obrigatório.", { status: 400 });
    }
    
    await connectDB();
    const user = await Usuario.findOne({ uidFirebase: uid }).lean();

    // Se o usuário tem uma URL de foto de perfil salva, redireciona para ela.
    if (user && user.fotoPerfilUrl) {
      return NextResponse.redirect(user.fotoPerfilUrl);
    }

    // Caso contrário, gera uma imagem de fallback com a inicial do nome.
    const fallbackLetter = user?.nome?.charAt(0).toUpperCase() || uid.charAt(0).toUpperCase() || '?';
    const fallbackUrl = `https://avatar.vercel.sh/${uid}.png?text=${fallbackLetter}`;
    return NextResponse.redirect(fallbackUrl);

  } catch (err: any) {
    console.error('Erro ao buscar avatar:', err);
    // Em caso de erro, ainda tenta retornar um fallback genérico.
    const fallbackUrl = `https://avatar.vercel.sh/${params.uid}.png?text=?`;
    return NextResponse.redirect(fallbackUrl);
  }
}
