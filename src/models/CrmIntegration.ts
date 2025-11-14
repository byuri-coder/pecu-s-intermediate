
import mongoose, { Schema, models } from "mongoose";

const CrmIntegrationSchema = new Schema({
  userId: { type: String, required: true, unique: true, index: true },
  crm: { type: String, required: true, enum: ["ploomes", "rdstation", "pipenrun"] },
  apiKey: { type: String, required: true }, // Should be encrypted at rest
  accountId: { type: String },
  connectedAt: { type: Date, default: Date.now },
  active: { type: Boolean, default: true },
  lastSync: { type: Date },
  syncStatus: { type: String, enum: ["success", "failed", "pending"], default: "pending" },
}, { timestamps: true });

export const CrmIntegration = models.CrmIntegration || mongoose.model("CrmIntegration", CrmIntegrationSchema);
