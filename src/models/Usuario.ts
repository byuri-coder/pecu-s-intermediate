import mongoose, { Schema, models } from "mongoose";

const UsuarioSchema = new Schema({
  uidFirebase: { type: String, required: true, unique: true },
  nome: { type: String },
  email: { type: String, required: true, unique: true },
  tipo: { type: String, enum: ["comprador", "vendedor", "administrador"], default: "comprador" },
  criadoEm: { type: Date, default: Date.now },
});

export const Usuario = models.Usuario || mongoose.model("Usuario", UsuarioSchema);
