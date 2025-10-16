// src/models/Contrato.ts
import mongoose, { Schema, models } from "mongoose";

const ContratoSchema = new Schema({
  uidFirebaseSeller: { type: String, required: true, index: true },
  uidFirebaseBuyer: { type: String, required: false, index: true },
  anuncioId: { type: Schema.Types.ObjectId, ref: "Anuncio" },
  status: { type: String, enum: ["pendente", "assinado", "cancelado"], default: "pendente", index: true },
  hashDocumento: { type: String }, // se gerar hash
  dados: { type: Schema.Types.Mixed },
  assinadoEm: { type: Date },
  criadoEm: { type: Date, default: Date.now },
}, { timestamps: true });

export const Contrato = models.Contrato || mongoose.model("Contrato", ContratoSchema);
