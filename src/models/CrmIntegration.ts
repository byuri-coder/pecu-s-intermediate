
import mongoose, { Schema, models } from "mongoose";

const CrmIntegrationSchema = new Schema({
  userId: { type: String, required: true, unique: true, index: true },
  integrationType: { type: String, enum: ['api', 'file'], required: true },
  crm: { type: String, enum: ["ploomes", "rdstation", "pipenrun", "externo", "interno"] },
  apiKey: { type: String }, // Should be encrypted at rest
  accountId: { type: String },
  connectedAt: { type: Date, default: Date.now },
  active: { type: Boolean, default: true },
  lastSync: { type: Date },
  syncStatus: { type: String, enum: ["success", "failed", "pending"], default: "pending" },
  crm_id: { type: String, index: true }, 
}, { timestamps: true });

export const CrmIntegration = models.CrmIntegration || mongoose.model("CrmIntegration", CrmIntegrationSchema);
