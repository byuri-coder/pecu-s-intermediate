
// src/models/Anuncio.ts
import mongoose, { Schema, models } from "mongoose";

const AnuncioSchema = new Schema({
  uidFirebase: { type: String, required: true, index: true }, // vinculação ao usuário
  titulo: { type: String, required: true },
  descricao: { type: String },
  tipo: { type: String, enum: ["rural-land", "carbon-credit", "tax-credit", "grain-insumo", "grain-pos-colheita", "grain-futuro", "other"], required: true },
  price: { type: Number },
  currency: { type: String, default: "BRL" },
  status: { type: String, enum: ["Disponível", "Negociando", "Vendido", "Pausado", "Ativo", "Deletado", "inativo", "cancelado", "finalizado"], default: "Disponível", index: true },
  deletedAt: { type: Date, default: null }, // Campo para soft delete
  crm_id: { type: String, index: true }, // Campo para ID do CRM
  
  imagens: { type: [{ 
    url: String, 
    type: { type: String, enum: ['image', 'video'] }, 
    alt: String 
  }], default: [] },
  
  metadados: { type: Schema.Types.Mixed },
}, { timestamps: true });

export const Anuncio = models.Anuncio || mongoose.model("Anuncio", AnuncioSchema);
