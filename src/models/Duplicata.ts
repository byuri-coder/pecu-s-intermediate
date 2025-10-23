// src/models/Duplicata.ts
import mongoose, { Schema, models } from "mongoose";

const DuplicataSchema = new Schema({
  negotiationId: { type: String, required: true, index: true },
  invoiceNumber: { type: String, required: true },
  orderNumber: { type: String, required: true },
  issueDate: { type: Date, required: true },
  dueDate: { type: Date, required: true },
  value: { type: Number, required: true },
  buyerId: { type: String, required: true, index: true }, // Changed to String to store uidFirebase
  sellerId: { type: String, required: true, index: true }, // Changed to String to store uidFirebase
  // qrCode: { type: Object }, // To store QR code data for PIX
  // pdfUrl: { type: String },
}, { timestamps: true });

export const Duplicata = models.Duplicata || mongoose.model("Duplicata", DuplicataSchema);
