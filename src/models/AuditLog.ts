
// src/models/AuditLog.ts
import mongoose, { Schema, models } from "mongoose";

const AuditLogSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'Usuario' },
  action: { type: String, required: true },
  details: { type: Schema.Types.Mixed },
  ipAddress: { type: String },
}, { timestamps: true });

export const AuditLog = models.AuditLog || mongoose.model("AuditLog", AuditLogSchema);
