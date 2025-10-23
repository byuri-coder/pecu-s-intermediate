// src/app/api/usuarios/get/[uid]/route.ts
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Usuario } from "@/models/Usuario";

export async function GET(req: Request, { params }: { params: { uid: string } }) {
  try {
    await connectDB();
    const { uid } = params;

    if (!uid) {
      return NextResponse.json({ ok: false, error: "UID do usuário é obrigatório" }, { status: 400 });
    }

    const usuario = await Usuario.findOne({ uidFirebase: uid }).lean();

    if (!usuario) {
      return NextResponse.json({ ok: false, error: "Usuário não encontrado" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, usuario });
  } catch (err: any) {
    console.error(`Erro /api/usuarios/get/${params.uid} (GET):`, err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
