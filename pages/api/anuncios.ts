import type { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "@/lib/mongodb";
import { Anuncio } from "@/models/Anuncio";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectToDatabase();

  if (req.method === "POST") {
    try {
      const anuncio = new Anuncio(req.body);
      await anuncio.save();
      return res.status(201).json({ message: "Anúncio criado com sucesso!", anuncio });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro ao criar anúncio" });
    }
  }

  if (req.method === "GET") {
    try {
      const anuncios = await Anuncio.find().sort({ createdAt: -1 });
      return res.status(200).json(anuncios);
    } catch (error) {
      return res.status(500).json({ error: "Erro ao buscar anúncios" });
    }
  }

  return res.status(405).json({ message: "Método não permitido" });
}
