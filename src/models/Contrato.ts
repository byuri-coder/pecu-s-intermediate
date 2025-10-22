// src/models/Contrato.ts
import mongoose, { Schema, models } from "mongoose";

// Sub-schemas for nested objects
const AcceptanceSchema = new Schema({
  accepted: { type: Boolean, default: false },
  date: { type: Date, default: null }
}, { _id: false });

const EmailValidationSchema = new Schema({
  validated: { type: Boolean, default: false },
  timestamp: { type: Date, default: null }
}, { _id: false });

const DocumentSchema = new Schema({
  fileUrl: { type: String, default: null }
}, { _id: false });

// Main schema for the 'contracts' collection
const ContratoSchema = new Schema({
  negotiationId: { type: String, required: true, unique: true, index: true },
  buyerId: { type: String, required: true, index: true },
  sellerId: { type: String, required: true, index: true },
  anuncioId: { type: Schema.Types.ObjectId, ref: "Anuncio", required: true },

  step: { type: Number, default: 1 }, // 1=Preenchimento, 2=Validação Email, 3=Documentos, 4=Finalizado
  status: { type: String, enum: ["in-progress", "frozen", "validated", "completed"], default: "in-progress" },

  acceptances: {
    buyer: { type: AcceptanceSchema, default: () => ({}) },
    seller: { type: AcceptanceSchema, default: () => ({}) }
  },

  emailValidation: {
    buyer: { type: EmailValidationSchema, default: () => ({}) },
    seller: { type: EmailValidationSchema, default: () => ({}) }
  },

  documents: {
    buyer: { type: DocumentSchema, default: () => ({}) },
    seller: { type: DocumentSchema, default: () => ({}) }
  },

  duplicatesGenerated: { type: Boolean, default: false },

  // Adicionando os campos do formulário diretamente aqui para persistência
  fields: {
      seller: {
          razaoSocial: { type: String, default: '' },
          cnpj: { type: String, default: '' },
          ie: { type: String, default: '' },
          endereco: { type: String, default: '' },
          email: { type: String, default: '' },
          paymentMethod: { type: String, enum: ['vista', 'parcelado'], default: 'vista' },
          installments: { type: String, default: '1' },
          interestPercent: { type: String, default: '0' }
      },
      buyer: {
          razaoSocial: { type: String, default: '' },
          cnpj: { type: String, default: '' },
          ie: { type: String, default: '' },
          endereco: { type: String, default: '' },
          email: { type: String, default: '' }
      }
  },
  
  completedAt: { type: Date }

}, { timestamps: true });

export const Contrato = models.Contrato || mongoose.model("Contrato", ContratoSchema);
