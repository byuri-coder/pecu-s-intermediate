
// src/models/Comprovante.ts
import mongoose, { Schema, models } from "mongoose";

const ComprovanteSchema = new Schema({
  faturaId: { type: Schema.Types.ObjectId, ref: 'Fatura', required: true },
  usuarioId: { type: Schema.Types.ObjectId, ref: 'Usuario', required: true },
  urlComprovante: { type: String, required: true },
  dataEnvio: { type: Date, default: Date.now },
  status: { type: String, enum: ['Pendente', 'Aprovado', 'Negado'], default: 'Pendente' },
  motivoRecusa: { type: String },
}, { timestamps: true });

export const Comprovante = models.Comprovante || mongoose.model("Comprovante", ComprovanteSchema);
