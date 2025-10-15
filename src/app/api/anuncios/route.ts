import { NextResponse } from "next/server";
import { connectMongo } from "@/lib/mongodb";
import { Anuncio } from "@/models/Anuncio";

export async function POST(req: Request) {
  try {
    await connectMongo();
    const data = await req.json();
    const anuncio = new Anuncio(data);
    await anuncio.save();
    return NextResponse.json({ message: "Anúncio criado com sucesso!", anuncio }, { status: 201 });
  } catch (error) {
    console.error("❌ Erro ao criar anúncio:", error);
    return NextResponse.json({ error: "Erro ao criar anúncio" }, { status: 500 });
  }
}

export async function GET() {
  try {
    await connectMongo();
    const anuncios = await Anuncio.find().sort({ createdAt: -1 });
    return NextResponse.json(anuncios, { status: 200 });
  } catch (error) {
    console.error("❌ Erro ao buscar anúncios:", error);
    return NextResponse.json({ error: "Erro ao buscar anúncios" }, { status: 500 });
  }
}
