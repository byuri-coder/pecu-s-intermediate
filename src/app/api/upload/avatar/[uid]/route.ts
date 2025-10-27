// src/app/api/upload/avatar/[uid]/route.ts
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Usuario } from '@/models/Usuario';

export const runtime = 'nodejs';

// Esta rota agora simula o salvamento de um arquivo e retorna uma URL pública.
// Em um ambiente de produção real, isso envolveria salvar em um bucket (S3, GCS)
// e obter a URL a partir daí. Por enquanto, vamos usar um placeholder.
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
    
    // Simulação de salvamento e geração de URL.
    // Em um projeto real, aqui você faria o upload para o Firebase Storage ou S3.
    // A URL seria a URL pública retornada por esse serviço.
    // Para este exercício, usaremos um placeholder previsível para demonstração.
    const publicImageUrl = `https://avatar.vercel.sh/${uid}.png?text=${file.name.substring(0, 1)}`;

    await connectDB();

    // Atualiza o usuário com a nova URL da foto de perfil.
    await Usuario.findOneAndUpdate(
      { uidFirebase: uid },
      { $set: { fotoPerfilUrl: publicImageUrl } },
      { upsert: true, new: true }
    );
    
    // Retorna a URL pública que o frontend irá usar
    return NextResponse.json({ success: true, photoURL: publicImageUrl });

  } catch (error: any) {
    console.error('Erro no upload do avatar:', error);
    return NextResponse.json({ error: 'Erro interno no servidor', details: error.message }, { status: 500 });
  }
}
