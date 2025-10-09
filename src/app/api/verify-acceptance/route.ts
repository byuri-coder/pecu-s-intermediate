// /app/api/verify-acceptance/route.ts
import { NextResponse } from "next/server";
import { validateContractInMemory } from "../contract-status/route";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const assetId = searchParams.get("assetId");
  const role = searchParams.get("role") as 'buyer' | 'seller' | null;
  const email = searchParams.get("email");

  if (!assetId || !role || !email) {
    console.error("Erro de validação: Parâmetros ausentes na URL.", { assetId, role, email });
    return NextResponse.redirect(new URL('/aceite-erro', req.url));
  }
  
  try {
    // Atualiza o status em memória
    validateContractInMemory(assetId, role);
    console.log(`VALIDATION: ${email} validou o contrato para o ativo ${assetId}.`);

    // Redireciona para a página de sucesso
    return NextResponse.redirect(new URL('/aceite-sucesso', req.url));

  } catch (error) {
    console.error("Erro interno ao validar o contrato:", error);
    return NextResponse.redirect(new URL('/aceite-erro', req.url));
  }
}