// src/app/api/admin/audit/route.ts
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { AuditLog } from "@/models/AuditLog";
import { Usuario } from "@/models/Usuario";

export async function GET(req: Request) {
  try {
    const db = await connectDB();
    if (!db) {
      return NextResponse.json({ ok: true, logs: [] });
    }

    const logs = await AuditLog.find({})
      .populate({ path: 'userId', model: Usuario, select: 'nome email' })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ ok: true, logs });

  } catch (err: any) {
    console.error("Erro /api/admin/audit:", err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
