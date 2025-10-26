
// src/models/Fatura.ts
import mongoose, { Schema, models } from "mongoose";

const FaturaSchema = new Schema({
  usuarioId: { type: Schema.Types.ObjectId, ref: 'Usuario', required: true },
  contratoId: { type: Schema.Types.ObjectId, ref: 'Contrato', required: true },
  numero: { type: String, required: true, unique: true },
  valor: { type: Number, required: true },
  dataEmissao: { type: Date, default: Date.now },
  dataVencimento: { type: Date, required: true },
  status: { type: String, enum: ['Pendente', 'Paga', 'Atrasada', 'Cancelada'], default: 'Pendente' },
  description: { type: String },
  motivoRecusa: { type: String }
}, { timestamps: true });

export const Fatura = models.Fatura || mongoose.model("Fatura", FaturaSchema);
