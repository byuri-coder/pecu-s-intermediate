// src/models/Evento.ts
import mongoose, { Schema, models } from "mongoose";

const EventoSchema = new Schema({
  usuarioId: { type: String, required: true, index: true }, // UID do Firebase
  titulo: { type: String, required: true },
  descricao: String,
  data: { type: Date, required: true },
  tipo: {
    type: String,
    enum: ["contrato", "duplicata", "reuniao", "tarefa", "outro"],
    default: "outro",
  },
  status: {
    type: String,
    enum: ["pendente", "concluido"],
    default: "pendente",
  },
}, { timestamps: true });

export const Evento = models.Evento || mongoose.model("Evento", EventoSchema);
