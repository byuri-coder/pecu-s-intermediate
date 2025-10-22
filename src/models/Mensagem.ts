// src/models/Mensagem.ts
import mongoose, { Schema, models } from "mongoose";

const MensagemSchema = new Schema({
  chatId: { type: String, required: true, index: true },
  senderId: { type: String, required: true, index: true },
  receiverId: { type: String, required: true, index: true },
  type: {
    type: String,
    enum: ["text", "image", "pdf", "location"],
    default: "text",
  },
  text: { type: String },
  fileUrl: { type: String },
  fileName: { type: String },
  fileType: { type: String },
  location: {
    latitude: Number,
    longitude: Number,
  },
  status: { type: String, enum: ['sent', 'delivered', 'read'], default: 'sent' },
}, { timestamps: true });

export const Mensagem = models.Mensagem || mongoose.model("Mensagem", MensagemSchema);
