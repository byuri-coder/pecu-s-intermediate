// src/models/Contrato.ts
import mongoose, { Schema, models } from "mongoose";

const PartySchema = new Schema({
  razaoSocial: { type: String, default: '' },
  cnpj: { type: String, default: '' },
  ie: { type: String, default: '' },
  endereco: { type: String, default: '' },
}, { _id: false });

const SellerFieldsSchema = new Schema({
  ...PartySchema.obj,
  paymentMethod: { type: String, enum: ['vista', 'parcelado'], default: 'vista' },
  installments: { type: String, default: '1' },
  interestPercent: { type: String, default: '0' },
}, { _id: false });


const ContractStateSchema = new Schema({
    isFrozen: { type: Boolean, default: false },
    finalizedAt: { type: Date },
    fields: {
        seller: { type: SellerFieldsSchema, default: {} },
        buyer: { type: PartySchema, default: {} },
    },
    sellerAgrees: { type: Boolean, default: false },
    buyerAgrees: { type: Boolean, default: false },
    verifications: {
        seller: { type: String, enum: ['pending', 'validated', 'expired'], default: 'pending' },
        buyer: { type: String, enum: ['pending', 'validated', 'expired'], default: 'pending' },
    },
    uploads: {
        seller: { type: Array, default: [] },
        buyer: { type: Array, default: [] },
    },
    frozenAt: { type: Date }
});


// Main schema for the 'contracts' collection
const ContratoSchema = new Schema({
  uidFirebaseSeller: { type: String, required: true, index: true },
  uidFirebaseBuyer: { type: String, required: false, index: true },
  anuncioId: { type: Schema.Types.ObjectId, ref: "Anuncio" },
  status: { type: String, enum: ["pendente", "assinado", "cancelado"], default: "pendente", index: true },
  hashDocumento: { type: String }, // se gerar hash
  dados: { type: ContractStateSchema },
  assinadoEm: { type: Date },
}, { timestamps: true });


export const Contrato = models.Contrato || mongoose.model("Contrato", ContratoSchema);
