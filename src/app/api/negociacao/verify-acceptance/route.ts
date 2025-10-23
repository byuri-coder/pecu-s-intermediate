// This file is deprecated and will be removed. 
// The logic has been moved to /api/negociacao/validate-email/route.ts
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  return NextResponse.json({ status: "deprecated" });
}
