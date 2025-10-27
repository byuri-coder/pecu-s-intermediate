
// src/models/Usuario.ts
import mongoose, { Schema, models } from "mongoose";

const UsuarioSchema = new Schema({
  uidFirebase: { type: String, required: true, unique: true, index: true },
  nome: { type: String },
  email: { type: String, required: true, unique: true, index: true },
  
  banco: String,
  agencia: String,
  conta: String,
  chavePix: String,

  inscricaoEstadual: String,
  estadoFiscal: String,
  cpfCnpj: String,

  endereco: String,
  cidade: String,
  estado: String,
  cep: String,

  autorizacoesEspeciais: { type: [String], default: [] },
  
  tipo: { type: String, enum: ["comprador", "vendedor", "administrador"], default: "comprador" },
  
  fotoPerfilUrl: { type: String }, // Stores the public URL to the profile picture
}, { timestamps: true });

export const Usuario = models.Usuario || mongoose.model("Usuario", UsuarioSchema);
