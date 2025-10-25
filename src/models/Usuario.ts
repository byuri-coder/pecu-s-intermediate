// src/models/Usuario.ts
import mongoose, { Schema, models } from "mongoose";

const UsuarioSchema = new Schema({
  uidFirebase: { type: String, required: true, unique: true, index: true },
  nome: { type: String },
  email: { type: String, required: true, unique: true, index: true },
  
  // Referência ao ID do arquivo no GridFS
  avatarId: { type: Schema.Types.ObjectId, default: null },

  // Dados bancários
  banco: String,
  agencia: String,
  conta: String,
  chavePix: String,

  // Dados Fiscais
  inscricaoEstadual: String,
  estadoFiscal: String,
  cpfCnpj: String,

  // Endereço
  endereco: String,
  cidade: String,
  estado: String,
  cep: String,

  // Autorizações Especiais
  autorizacoesEspeciais: { type: [String], default: [] },
  
  tipo: { type: String, enum: ["comprador", "vendedor", "administrador"], default: "comprador" },
}, { timestamps: true });

export const Usuario = models.Usuario || mongoose.model("Usuario", UsuarioSchema);
