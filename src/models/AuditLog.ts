
// src/models/AuditLog.ts
import mongoose, { Schema, models } from "mongoose";

const AuditLogSchema = new Schema({
  userId: { type: String, required: true, index: true }, // Store Firebase UID
  action: { type: String, required: true },
  details: { type: Schema.Types.Mixed },
  ipAddress: { type: String },
}, { timestamps: true });

export const AuditLog = models.AuditLog || mongoose.model("AuditLog", AuditLogSchema);
