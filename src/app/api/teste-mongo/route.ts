import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";

export async function GET() {
  try {
    const db = await connectDB();
    if (!db) {
        return NextResponse.json({ ok: true, msg: "MongoDB está desativado (modo mock)." });
    }
    return NextResponse.json({ ok: true, msg: "Conectado ao MongoDB Atlas!" });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
