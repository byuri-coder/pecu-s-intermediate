// src/models/Mensagem.ts
import mongoose, { Schema, models } from "mongoose";

const ChatMessageSchema = new mongoose.Schema({
  chatId: { type: String, required: true, index: true },
  senderId: { type: String, required: true, index: true },
  receiverId: { type: String, required: true, index: true },
  type: {
    type: String,
    enum: ["text", "image", "pdf", "location"],
    default: "text",
  },
  text: { type: String },
  fileUrl: { type: String }, // Can store base64 data URI for simplicity
  fileName: { type: String },
  fileType: { type: String },
  location: {
    latitude: Number,
    longitude: Number,
  },
  // Embed sender's info for quick display without extra lookups
  user: { 
      name: String,
      profileImage: String // This will store the /api/avatar/[uid] URL
  }
}, { timestamps: true });


export const Mensagem = models.ChatMessage || mongoose.model("ChatMessage", ChatMessageSchema);
