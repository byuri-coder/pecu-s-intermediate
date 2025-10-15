import mongoose, { Schema, models, model } from "mongoose";

const AnuncioSchema = new Schema(
  {
    titulo: { type: String, required: true },
    descricao: { type: String },
    preco: { type: Number, required: true },
    categoria: { type: String },
    imagens: [{ type: String }],
    usuarioId: { type: String, required: true },
    criadoEm: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

// evita recriar o modelo se já existir (importante em ambiente Next.js)
const Anuncio = models.Anuncio || model("Anuncio", AnuncioSchema);

export { Anuncio };
