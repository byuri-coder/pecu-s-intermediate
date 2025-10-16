// src/models/Anuncio.ts
import mongoose, { Schema, models } from "mongoose";

const AnuncioSchema = new Schema({
  uidFirebase: { type: String, required: true, index: true }, // vinculação ao usuário
  titulo: { type: String, required: true },
  descricao: { type: String },
  tipo: { type: String, enum: ["rural-land", "carbon-credit", "tax-credit", "other"], default: "rural-land" },
  price: { type: Number },
  currency: { type: String, default: "BRL" },
  status: { type: String, enum: ["Disponível", "Negociando", "Vendido"], default: "Disponível", index: true },
  imagens: [{ url: String, alt: String, type: { type: String, enum: ['image', 'video'], default: 'image' } }],
  metadados: { type: Schema.Types.Mixed },
}, { timestamps: true });

export const Anuncio = models.Anuncio || mongoose.model("Anuncio", AnuncioSchema);
