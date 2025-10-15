import mongoose, { Schema, models } from "mongoose";

const AnuncioSchema = new Schema(
  {
    titulo: { type: String, required: true },
    descricao: { type: String, required: true },
    preco: { type: Number, required: true },
    usuarioId: { type: String, required: true },
  },
  { timestamps: true }
);

export const Anuncio = models.Anuncio || mongoose.model("Anuncio", AnuncioSchema);
