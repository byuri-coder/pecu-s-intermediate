// src/models/Mensagem.ts
import mongoose, { Schema, models } from "mongoose";

const MensagemSchema = new Schema({
  chatId: { type: String, required: true, index: true }, // ID da sala de chat (ex: ID do anúncio)
  senderId: { type: String, required: true }, // UID do Firebase de quem enviou
  content: { type: String, required: true },
  type: { type: String, enum: ['text', 'image', 'pdf', 'location'], default: 'text' },
  // O Mongoose adiciona 'createdAt' e 'updatedAt' automaticamente com a opção timestamps
}, { timestamps: true });

export const Mensagem = models.Mensagem || mongoose.model("Mensagem", MensagemSchema);
