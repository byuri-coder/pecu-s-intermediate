import { NextResponse } from "next/server";
import { connectMongo } from "@/lib/mongodb";

export async function GET() {
  try {
    await connectMongo();
    return NextResponse.json({ ok: true, msg: "Conectado ao MongoDB Atlas!" });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
