
// src/models/ChatRoom.ts
import mongoose, { Schema, models } from "mongoose";

const ChatRoomSchema = new Schema({
  buyerId: { type: String, required: true, index: true },
  sellerId: { type: String, required: true, index: true },
  assetId: { type: String, required: true, index: true },
}, { timestamps: true });

// Ensures that there are no duplicate chats for the same buyer/seller/asset combination
ChatRoomSchema.index({ buyerId: 1, sellerId: 1, assetId: 1 }, { unique: true });

export const ChatRoom = models.ChatRoom || mongoose.model("ChatRoom", ChatRoomSchema);
