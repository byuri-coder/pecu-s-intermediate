// src/models/ImportAuditLog.ts
import mongoose, { Schema, models } from "mongoose";

const ImportAuditLogSchema = new Schema({
  userId: { type: String, required: true, index: true },
  integrationType: { type: String, required: true },
  originalFileName: { type: String },
  totalRegistros: { type: Number },
  credentials: { type: Object },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

export const ImportAuditLog = models.ImportAuditLog || mongoose.model("ImportAuditLog", ImportAuditLogSchema);
